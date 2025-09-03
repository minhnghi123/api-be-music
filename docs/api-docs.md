# Music API Documentation

## Tổng quan

Đây là tài liệu RESTful API cho hệ thống quản lý music, artist, playlist, topic, user, authentication, admin.

---

## Authentication

### Đăng ký

- **POST** `/auth/sign-up`
- **Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "rePassword": "string"
}
```

- **Response:**

```json
{ "success": true, "message": "Sign up page (API only)" }
```

### Đăng nhập

- **POST** `/auth/login`
- **Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

- **Response:**

```json
{ "success": true, "message": "Login page (API only)" }
```

### Đăng xuất

- **POST** `/auth/logout`
- **Response:**

```json
{ "code": 200, "message": "Logout successfully" }
```

### Đăng nhập Google OAuth2

- **GET** `/auth/google`
- **GET** `/auth/google/callback`

---

## Client API

### Home

- **GET** `/`  
  Trả về trang chủ, tìm kiếm, autocomplete.
- **GET** `/autocomplete`  
  Gợi ý từ khóa bài hát.

### Music

- **GET** `/music/songs`
- **GET** `/music/songs/:id`
- **POST** `/music/songs`
- **PUT** `/music/songs/:id`
- **DELETE** `/music/songs/:id`
  > Xem chi tiết response ở phần Song bên dưới.

### Artist

- **GET** `/artist/:id`  
  Trả về thông tin nghệ sĩ, danh sách bài hát, trạng thái follow.
- **PATCH** `/artist/:id`  
  Follow nghệ sĩ.

### Playlist

- **GET** `/playlist`
- **GET** `/playlist/:id`
- **POST** `/playlist/create-playlist`
- **PATCH** `/playlist/add-playlist`
- **PATCH** `/playlist/save-playlist/:id`  
  Thêm, lưu, tạo playlist.

### Topic

- **GET** `/topics/:id`  
  Trả về thông tin chủ đề, danh sách bài hát theo chủ đề.
- **PATCH** `/topics/:id`  
  Follow chủ đề.

### Favorite Song

- **GET** `/favorite-songs`  
  Lấy danh sách bài hát yêu thích của user.
- **PATCH** `/favorite-songs/favorite-song/:id`  
  Thêm bài hát vào danh sách yêu thích.

### User

- **GET** `/user/profile/:userId`  
  Lấy thông tin profile user.

---

## Admin API

### Dashboard

- **GET** `/admin/dashboard`  
  Trả về thông tin dashboard.

### Music (Quản lý bài hát)

- **GET** `/admin/songs`  
  Lấy danh sách bài hát.
- **GET** `/admin/songs/create`  
  Trả về form tạo bài hát.
- **POST** `/admin/songs/create`  
  Tạo mới bài hát (có upload avatar/audio).
- **GET** `/admin/songs/edit/:id`  
  Trả về form chỉnh sửa bài hát.
- **PATCH** `/admin/songs/edit/:id`  
  Chỉnh sửa bài hát (có upload avatar/audio).
- **PATCH** `/admin/songs/delete/:id`  
  Xóa (soft delete) bài hát.

### Playlist (Quản lý playlist)

- **GET** `/admin/playlists`
- **GET** `/admin/playlists/create`
- **POST** `/admin/playlists/create`  
  Tạo mới playlist (có upload avatar).

### Topic (Quản lý chủ đề)

- **GET** `/admin/topics`
- **GET** `/admin/topics/create`
- **POST** `/admin/topics/create`  
  Tạo mới chủ đề (có upload ảnh).
- **GET** `/admin/topics/edit/:id`
- **PATCH** `/admin/topics/edit/:id`  
  Chỉnh sửa chủ đề (có upload ảnh).
- **DELETE** `/admin/topics/delete/:id`  
  Xóa chủ đề.

### Account (Quản lý tài khoản)

- **GET** `/admin/accounts/admin`  
  Lấy danh sách tài khoản admin.
- **GET** `/admin/accounts/customer`  
  Lấy danh sách tài khoản khách hàng.

---

## Song

### Lấy tất cả bài hát

- **GET** `/music/songs`
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "artist": { "id": "string", "fullName": "string" },
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

- **GET** `/music/songs/:id`
- **Response:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "artist": { "id": "string", "fullName": "string" },
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

- **POST** `/music/songs`
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

- **PUT** `/music/songs/:id`
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

- **DELETE** `/music/songs/:id`
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

- **GET** `/music/artists`
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

- **GET** `/music/artists/:id`
- **Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
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

- **POST** `/music/artists`
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

- **PUT** `/music/artists/:id`
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

- **DELETE** `/music/artists/:id`
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

- **GET** `/music/playlists`
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

- **GET** `/music/playlists/:id`
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

- **POST** `/music/playlists`
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

- **PUT** `/music/playlists/:id`
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

- **DELETE** `/music/playlists/:id`
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

- **GET** `/music/topics`
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

- **GET** `/music/topics/:id`
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

- **POST** `/music/topics`
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

- **PUT** `/music/topics/:id`
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

- **DELETE** `/music/topics/:id`
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

- **GET** `/music/users`
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

- **GET** `/music/users/:id`
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

- **POST** `/music/users`
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

- **PUT** `/music/users/:id`
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

- **DELETE** `/music/users/:id`
- **Response:**

```json
{
  "success": true,
  "message": "User deleted"
}
```

---

## Các API đặc biệt client

### Artist

- **GET** `/artist/:id`  
  Trả về thông tin nghệ sĩ, danh sách bài hát, trạng thái follow.
- **PATCH** `/artist/:id`  
  Follow nghệ sĩ.

### Topic

- **GET** `/topics/:id`  
  Trả về thông tin chủ đề, danh sách bài hát theo chủ đề.
- **PATCH** `/topics/:id`  
  Follow chủ đề.

### Playlist

- **GET** `/playlist/:id`  
  Lấy chi tiết playlist.
- **POST** `/playlist/create-playlist`  
  Tạo mới playlist.
- **PATCH** `/playlist/add-playlist`  
  Thêm bài hát vào playlist.
- **PATCH** `/playlist/save-playlist/:id`  
  Lưu playlist với ảnh.

### Favorite Song

- **GET** `/favorite-songs`  
  Lấy danh sách bài hát yêu thích của user.
- **PATCH** `/favorite-songs/favorite-song/:id`  
  Thêm bài hát vào danh sách yêu thích.

### User

- **GET** `/user/profile/:userId`  
  Lấy thông tin profile user.

---

## Admin API chi tiết

### Dashboard

- **GET** `/admin/dashboard`  
  Trả về thông tin dashboard.

### Music

- **GET** `/admin/songs`  
  Lấy danh sách bài hát.
- **GET** `/admin/songs/create`  
  Trả về form tạo bài hát.
- **POST** `/admin/songs/create`  
  Tạo mới bài hát (có upload avatar/audio).
- **GET** `/admin/songs/edit/:id`  
  Trả về form chỉnh sửa bài hát.
- **PATCH** `/admin/songs/edit/:id`  
  Chỉnh sửa bài hát (có upload avatar/audio).
- **PATCH** `/admin/songs/delete/:id`  
  Xóa (soft delete) bài hát.

### Playlist

- **GET** `/admin/playlists`
- **GET** `/admin/playlists/create`
- **POST** `/admin/playlists/create`  
  Tạo mới playlist (có upload avatar).

### Topic

- **GET** `/admin/topics`
- **GET** `/admin/topics/create`
- **POST** `/admin/topics/create`  
  Tạo mới chủ đề (có upload ảnh).
- **GET** `/admin/topics/edit/:id`
- **PATCH** `/admin/topics/edit/:id`  
  Chỉnh sửa chủ đề (có upload ảnh).
- **DELETE** `/admin/topics/delete/:id`  
  Xóa chủ đề.

### Account

- **GET** `/admin/accounts/admin`  
  Lấy danh sách tài khoản admin.
- **GET** `/admin/accounts/customer`  
  Lấy danh sách tài khoản khách hàng.

---

## Lưu ý

- Các API upload file sử dụng multipart/form-data.
- Các API đều trả về trường `success`, `data`, hoặc `message`.
- Đường dẫn có thể có prefix `/admin` hoặc `/music` tùy loại API.

## Ví dụ sử dụng với curl

```bash
curl -X GET http://localhost:3000/music/songs
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"user","password":"pass"}'
```

## Autocomplete

### Gợi ý bài hát theo từ khóa

- **GET** `/autocomplete?q=keyword`
- **Query param:**
  - `q`: từ khóa cần gợi ý
- **Response thành công:**

```json
{
  "success": true,
  "data": [
    { "title": "string" },
    ...
  ]
}
```

- **Response lỗi:**

```json
{
  "success": false,
  "message": "Missing or invalid keyword"
}
```
