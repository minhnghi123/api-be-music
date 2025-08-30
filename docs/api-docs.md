# Music API Documentation

## Tổng quan

Đây là tài liệu RESTful API cho hệ thống quản lý music, artist, playlist, topic, user.

---

## Song

### Lấy tất cả bài hát

- **GET** `/api/music/songs`
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "artist": "string",
      "album": "string",
      "topic": ["string"],
      "fileUrl": "string",
      "coverImage": "string",
      "likes": ["string"],
      "lyrics": "string",
      "description": "string",
      "status": "string",
      "deleted": false,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### Lấy chi tiết bài hát

- **GET** `/api/music/songs/:id`
- **Response:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "artist": "string",
    "album": "string",
    "topic": ["string"],
    "fileUrl": "string",
    "coverImage": "string",
    "likes": ["string"],
    "lyrics": "string",
    "description": "string",
    "status": "string",
    "deleted": false,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Tạo mới bài hát

- **POST** `/api/music/songs`
- **Body:**

```json
{
  "title": "string",
  "artist": "string",
  "album": "string",
  "topic": ["string"],
  "fileUrl": "string",
  "coverImage": "string",
  "lyrics": "string",
  "description": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...song }
}
```

### Cập nhật bài hát

- **PUT** `/api/music/songs/:id`
- **Body:**

```json
{
  "title": "string",
  "artist": "string",
  "album": "string",
  "topic": ["string"],
  "fileUrl": "string",
  "coverImage": "string",
  "lyrics": "string",
  "description": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...song }
}
```

### Xóa bài hát

- **DELETE** `/api/music/songs/:id`
- **Response:**

```json
{
  "success": true,
  "message": "Song deleted"
}
```

---

## Artist

### Lấy tất cả nghệ sĩ

- **GET** `/api/music/artists`
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "fullName": "string",
      "country": "string",
      "albums": ["string"],
      "songs": ["string"],
      "coverImage": "string",
      "status": "string",
      "deleted": false,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### Lấy chi tiết nghệ sĩ

- **GET** `/api/music/artists/:id`
- **Response:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "fullName": "string",
    "country": "string",
    "albums": ["string"],
    "songs": ["string"],
    "coverImage": "string",
    "status": "string",
    "deleted": false,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Tạo mới nghệ sĩ

- **POST** `/api/music/artists`
- **Body:**

```json
{
  "fullName": "string",
  "country": "string",
  "albums": ["string"],
  "songs": ["string"],
  "coverImage": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...artist }
}
```

### Cập nhật nghệ sĩ

- **PUT** `/api/music/artists/:id`
- **Body:**

```json
{
  "fullName": "string",
  "country": "string",
  "albums": ["string"],
  "songs": ["string"],
  "coverImage": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...artist }
}
```

### Xóa nghệ sĩ

- **DELETE** `/api/music/artists/:id`
- **Response:**

```json
{
  "success": true,
  "message": "Artist deleted"
}
```

---

## Playlist

### Lấy tất cả playlist

- **GET** `/api/music/playlists`
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "songs": ["string"],
      "user_id": "string",
      "coverImage": "string",
      "createdBy": "string",
      "status": "string",
      "deleted": false,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### Lấy chi tiết playlist

- **GET** `/api/music/playlists/:id`
- **Response:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "songs": ["string"],
    "user_id": "string",
    "coverImage": "string",
    "createdBy": "string",
    "status": "string",
    "deleted": false,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Tạo mới playlist

- **POST** `/api/music/playlists`
- **Body:**

```json
{
  "title": "string",
  "description": "string",
  "songs": ["string"],
  "user_id": "string",
  "coverImage": "string",
  "createdBy": "string",
  "status": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...playlist }
}
```

### Cập nhật playlist

- **PUT** `/api/music/playlists/:id`
- **Body:**

```json
{
  "title": "string",
  "description": "string",
  "songs": ["string"],
  "user_id": "string",
  "coverImage": "string",
  "createdBy": "string",
  "status": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...playlist }
}
```

### Xóa playlist

- **DELETE** `/api/music/playlists/:id`
- **Response:**

```json
{
  "success": true,
  "message": "Playlist deleted"
}
```

---

## Topic

### Lấy tất cả chủ đề

- **GET** `/api/music/topics`
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "imgTopic": "string",
      "content": "string",
      "deleted": false,
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### Lấy chi tiết chủ đề

- **GET** `/api/music/topics/:id`
- **Response:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "imgTopic": "string",
    "content": "string",
    "deleted": false,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Tạo mới chủ đề

- **POST** `/api/music/topics`
- **Body:**

```json
{
  "title": "string",
  "imgTopic": "string",
  "content": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...topic }
}
```

### Cập nhật chủ đề

- **PUT** `/api/music/topics/:id`
- **Body:**

```json
{
  "title": "string",
  "imgTopic": "string",
  "content": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...topic }
}
```

### Xóa chủ đề

- **DELETE** `/api/music/topics/:id`
- **Response:**

```json
{
  "success": true,
  "message": "Topic deleted"
}
```

---

## User

### Lấy tất cả user

- **GET** `/api/music/users`
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string",
      "playlist": ["string"],
      "follow_songs": ["string"],
      "follow_artists": ["string"],
      "deleted": false,
      "status": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### Lấy chi tiết user

- **GET** `/api/music/users/:id`
- **Response:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "playlist": ["string"],
    "follow_songs": ["string"],
    "follow_artists": ["string"],
    "deleted": false,
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Tạo mới user

- **POST** `/api/music/users`
- **Body:**

```json
{
  "username": "string",
  "email": "string",
  "avatar": "string",
  "playlist": ["string"],
  "follow_songs": ["string"],
  "follow_artists": ["string"],
  "status": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...user }
}
```

### Cập nhật user

- **PUT** `/api/music/users/:id`
- **Body:**

```json
{
  "username": "string",
  "email": "string",
  "avatar": "string",
  "playlist": ["string"],
  "follow_songs": ["string"],
  "follow_artists": ["string"],
  "status": "string"
}
```

- **Response:**

```json
{
  "success": true,
  "data": { ...user }
}
```

### Xóa user

- **DELETE** `/api/music/users/:id`
- **Response:**

```json
{
  "success": true,
  "message": "User deleted"
}
```

---

## Lưu ý

- Tất cả response đều có trường `success`, `data` hoặc `message`.
- Đường dẫn API có thể cần prefix `/api/music` tùy cấu hình router.
- Các trường trong body có thể mở rộng theo model thực tế.

## Ví dụ sử dụng với curl

```bash
curl -X GET http://localhost:3000/api/music/songs
curl -X POST http://localhost:3000/api/music/songs -H "Content-Type: application/json" -d '{"title":"Song Name","artist":"Artist Name"}'
```
