import sys
import json
import instaloader
import os

def fetch_hashtag(hashtag):
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        save_metadata=False,
    )

    username = os.environ.get("IG_USERNAME", "")
    password = os.environ.get("IG_PASSWORD", "")

    if username and password:
        try:
            L.login(username, password)
        except instaloader.exceptions.TwoFactorAuthRequiredException:
            print(json.dumps({"error": "2FA is enabled on this Instagram account. Please disable 2FA or use an account without it."}))
            sys.exit(1)
        except Exception as e:
            print(json.dumps({"error": f"Instagram Login Failed: {str(e)}. Please check your phone to approve the login ('This was me') or verify your password."}))
            sys.exit(1)

    posts_data = []
    try:
        hashtag_obj = instaloader.Hashtag.from_name(L.context, hashtag)
        count = 0
        for post in hashtag_obj.get_recent_posts():
            posts_data.append({
                "id": post.shortcode,
                "caption": post.caption if post.caption else "",
                "media_type": "VIDEO" if post.is_video else "IMAGE",
                "timestamp": post.date_utc.isoformat() + "Z",
                "username": post.owner_username
            })
            count += 1
            if count >= 25:  # Fetch top 25 latest
                break
        print(json.dumps(posts_data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        fetch_hashtag(sys.argv[1])
    else:
        print(json.dumps({"error": "No hashtag provided"}))
        sys.exit(1)
