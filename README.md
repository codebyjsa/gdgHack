# gdgHack - API Documentation

## Base URL
`http://your-domain.com/api`

## Authentication
Most endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Table of Contents
- [Educator APIs](#educator-apis)
- [Student APIs](#student-apis)
- [Course APIs](#course-apis)

---

## Educator APIs

### Create Educator
- **URL**: `/educators/createEducator`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123!",
  "educator_name": "John Doe",
  "bio": "Experienced educator with 5+ years of teaching mathematics and physics.",
  "subjects": ["Mathematics", "Physics", "Calculus"],
  "educator_photo_key": "profile-photos/john-doe-123.jpg"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Educator created successfully",
  "data": {
    "educator_id": "550e8400-e29b-41d4-a716-446655440000",
    "educator_name": "John Doe",
    "bio": "Experienced educator with 5+ years of teaching mathematics and physics.",
    "subjects": ["Mathematics", "Physics", "Calculus"],
    "educator_photo_key": "profile-photos/john-doe-123.jpg",
    "rating_sum": 0,
    "rating_count": 0,
    "follower_count": 0
  }
}
```

### Get All Educators
- **URL**: `/educators/getEducators`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "educator_id": "550e8400-e29b-41d4-a716-446655440000",
      "educator_name": "John Doe",
      "bio": "Experienced educator...",
      "subjects": ["Mathematics", "Physics"],
      "educator_photo_key": "profile-photos/john-doe-123.jpg",
      "rating_sum": 0,
      "rating_count": 0,
      "follower_count": 0
    }
  ]
}
```

### Update Educator
- **URL**: `/educators/updateEducator/:id`
- **Method**: `PUT`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "educator_name": "John D.",
  "bio": "Updated bio information"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Educator updated successfully",
  "data": {
    "educator_id": "550e8400-e29b-41d4-a716-446655440000",
    "educator_name": "John D.",
    "bio": "Updated bio information",
    "subjects": ["Mathematics", "Physics", "Calculus"],
    "educator_photo_key": "profile-photos/john-doe-123.jpg"
  }
}
```

---

## Student APIs

### Create Student
- **URL**: `/students/createStudent`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
  "email": "alice.smith@example.com",
  "password": "Student@123",
  "student_name": "Alice Smith",
  "student_photo_key": "profile-photos/alice-smith-456.jpg"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "student_id": "660e8400-e29b-41d4-a716-446655440001",
    "student_name": "Alice Smith",
    "enrolled_courses": 0,
    "completed_courses": 0,
    "following_count": 0,
    "student_photo_key": "profile-photos/alice-smith-456.jpg"
  }
}
```

### Get All Students
- **URL**: `/students/getStudents`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "student_id": "660e8400-e29b-41d4-a716-446655440001",
      "student_name": "Alice Smith",
      "enrolled_courses": 3,
      "completed_courses": 1,
      "following_count": 5,
      "student_photo_key": "profile-photos/alice-smith-456.jpg"
    }
  ]
}
```

---

## Course APIs

### Create Course
- **URL**: `/courses/createCourse`
- **Method**: `POST`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "educator_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Introduction to Web Development",
  "description": "Learn the basics of web development with HTML, CSS, and JavaScript",
  "price": 49.99,
  "course_cover_image_key": "covers/web-dev-intro.jpg",
  "is_published": true
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "course_id": "770e8400-e29b-41d4-a716-446655440002",
    "educator_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Introduction to Web Development",
    "description": "Learn the basics of web development with HTML, CSS, and JavaScript",
    "price": 49.99,
    "course_cover_image_key": "covers/web-dev-intro.jpg",
    "is_published": true,
    "created_at": "2025-09-07T01:30:00.000Z",
    "rating_sum": 0,
    "rating_count": 0,
    "star_rating": 0,
    "enrollment_count": 0,
    "follower_count": 0
  }
}
```

### Get All Courses
- **URL**: `/courses/getCourses`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `educator_id` (optional): Filter by educator
  - `is_published` (optional): true/false

**Example**: `/courses/getCourses?educator_id=550e8400-e29b-41d4-a716-446655440000&is_published=true`

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "course_id": "770e8400-e29b-41d4-a716-446655440002",
      "educator_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Introduction to Web Development",
      "description": "Learn the basics of web development...",
      "price": 49.99,
      "course_cover_image_key": "covers/web-dev-intro.jpg",
      "is_published": true,
      "created_at": "2025-09-07T01:30:00.000Z",
      "rating_sum": 0,
      "rating_count": 0,
      "star_rating": 0,
      "enrollment_count": 0,
      "follower_count": 0
    }
  ]
}
```

### Update Course
- **URL**: `/courses/updateCourse/:id`
- **Method**: `PUT`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "title": "Updated Course Title",
  "description": "Updated course description with more details",
  "price": 59.99,
  "is_published": false
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "course_id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Updated Course Title",
    "description": "Updated course description with more details",
    "price": 59.99,
    "is_published": false
  }
}