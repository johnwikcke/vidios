# 🎯 Internet Archive Setup Guide

## Step 1: Create Account
1. Go to: https://archive.org
2. Click "Sign up" (top right)
3. Create free account with email

## Step 2: Upload Videos
1. Click "Upload" in top menu
2. Click "Upload files to Internet Archive"
3. Fill out the form:
   - **Title**: "Phone Store Display Videos"
   - **Identifier**: "phone-store-videos-2024" (IMPORTANT: Use exactly this!)
   - **Creator**: Your name
   - **Subject**: "promotional videos"
   - **Description**: "Phone promotional videos for store display"
   - **Collection**: "Community Video"

4. **Upload all your video files**:
   - Drag & drop all 10 MP4 files
   - Wait for upload (may take 10-30 minutes for 312MB)

## Step 3: Get Your URLs
After upload completes, your videos will be available at:
```
https://archive.org/download/phone-store-videos-2024/VIDEO_NAME.mp4
```

## Step 4: Update Video Names (If Needed)
If your video filenames are different, update the script.js file:
- Replace the video names in the `archiveBaseUrl +` lines
- Use URL encoding for spaces (%20) and special characters

## Step 5: Test
1. Wait 5-10 minutes after upload
2. Test one URL in browser
3. Deploy your updated code

## ✅ Benefits:
- **Unlimited bandwidth** - Perfect for 24/7 looping
- **Unlimited storage** - 312MB is nothing
- **Global CDN** - Fast loading worldwide
- **Smart TV compatible** - Works in any browser
- **100% FREE** - No limits, no costs

## 🔧 Troubleshooting:
- If videos don't load, check the identifier matches exactly
- Make sure videos are public (not private)
- URL encode special characters in filenames