import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

async function createTestUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    process.exit(1)
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey // Note: We need the service role key to create users
  )

  try {
    // Create test user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'testpassword123',
      email_confirm: true
    })

    if (createError) {
      console.error('Error creating test user:', createError.message)
      return
    }

    console.log('Test user created successfully:', user)
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestUser()
