const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const https = require('https')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Create backup directory
const backupDir = path.join(__dirname, 'media-backup')
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}

async function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(backupDir, filename)
    const file = fs.createWriteStream(filePath)
    
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(filePath)
      })
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}) // Delete partial file
      reject(err)
    })
  })
}

async function backupMedia() {
  try {
    console.log('🔍 Fetching media files list...')
    
    // Get all files from media bucket
    const { data: files, error } = await supabase.storage
      .from('media')
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })

    if (error) {
      console.error('❌ Error fetching files:', error.message)
      return
    }

    if (!files || files.length === 0) {
      console.log('📁 No media files found')
      return
    }

    console.log(`📁 Found ${files.length} media files`)
    console.log('⬇️  Starting download...')

    let downloaded = 0
    let failed = 0

    for (const file of files) {
      try {
        // Get public URL
        const { data } = supabase.storage
          .from('media')
          .getPublicUrl(file.name)

        console.log(`⬇️  Downloading: ${file.name}`)
        
        await downloadFile(data.publicUrl, file.name)
        downloaded++
        
        console.log(`✅ Downloaded: ${file.name}`)
      } catch (error) {
        console.error(`❌ Failed to download ${file.name}:`, error.message)
        failed++
      }
    }

    console.log('\n📊 Backup Summary:')
    console.log(`✅ Successfully downloaded: ${downloaded} files`)
    console.log(`❌ Failed downloads: ${failed} files`)
    console.log(`📁 Files saved to: ${backupDir}`)
    
    // Create backup info file
    const backupInfo = {
      created_at: new Date().toISOString(),
      total_files: files.length,
      downloaded: downloaded,
      failed: failed,
      backup_location: backupDir,
      files: files.map(f => ({
        name: f.name,
        size: f.metadata?.size || 0,
        created_at: f.created_at
      }))
    }
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-info.json'),
      JSON.stringify(backupInfo, null, 2)
    )
    
    console.log('📄 Backup info saved to backup-info.json')
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message)
  }
}

// Run the backup
backupMedia()