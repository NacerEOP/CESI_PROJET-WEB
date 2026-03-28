# SFx5 – Évaluer une entreprise (Evaluate Company)
## Feature Documentation

---

## 1. Overview

**SFx5** is a feature that allows authorized users (Admin and Pilot roles) to evaluate companies that are part of the internship program. Users can submit a numeric rating (1-5 stars) along with optional feedback comments. The system calculates and displays average ratings and maintains a history of all evaluations.

### Feature Code
- **SFx5**: Évaluer une entreprise

### Permissions Matrix
| Role | Can Evaluate | Can View | Can Delete Own |
|------|-------------|----------|----------------|
| Administrateur (Admin) | ✅ Yes | ✅ Yes | ✅ Yes |
| Pilote (Pilot) | ✅ Yes | ✅ Yes | ✅ Yes |
| Étudiant (Student) | ❌ No | ✅ Yes | ❌ N/A |
| Anonyme (Anonymous) | ❌ No | ✅ Yes | ❌ N/A |

---

## 2. Technical Architecture

### Database Schema

#### RatingAdmin Table
```sql
CREATE TABLE RatingAdmin(
   IdCompany INT,
   IdUser INT,
   Rating TINYINT,
   RatingText VARCHAR(50),
   PRIMARY KEY(IdCompany, IdUser),
   FOREIGN KEY(IdCompany) REFERENCES Companies(IdCompany),
   FOREIGN KEY(IdUser) REFERENCES Admin(IdUser)
);
```

#### RatingPilot Table
```sql
CREATE TABLE RatingPilot(
   IdCompany INT,
   IdUser INT,
   Rating TINYINT NOT NULL,
   RatingText VARCHAR(50),
   PRIMARY KEY(IdCompany, IdUser),
   FOREIGN KEY(IdCompany) REFERENCES Companies(IdCompany),
   FOREIGN KEY(IdUser) REFERENCES Pilot(IdUser)
);
```

### MVC Components

#### Model: CompanyRatingModel
**Location**: `src/Models/CompanyRatingModel.php`

**Responsibilities**:
- Manage all database operations for company ratings
- Separate handling for admin and pilot ratings
- Calculate statistics (average, count)

**Key Methods**:
```php
// Save or update a rating
public function saveRating($companyId, $userId, $rating, $ratingText, $userRole)

// Retrieve user's specific rating
public function getRating($companyId, $userId, $userRole)

// Get average rating across all evaluators
public function getAverageRating($companyId)

// Get all ratings with evaluator details
public function getCompanyRatings($companyId)

// Count total ratings
public function getRatingCount($companyId)

// Delete a rating
public function deleteRating($companyId, $userId, $userRole)
```

#### Controller: CompanyController
**Location**: `src/Controllers/CompanyController.php`

**New Methods**:
- `rate()` - Handles POST requests to submit/update ratings
- `getRatings()` - Handles GET requests to fetch rating data

**Key Features**:
- Role-based authorization checks
- Input validation
- Error handling with appropriate HTTP status codes
- JSON response format

#### View: companies.twig.html
**Location**: `src/Views/companies.twig.html`

**New Components**:
- Rating column in company table
- "View & Rate" button for authorized users
- Modal dialog for company details
- Star rating widget (interactive 1-5 stars)
- Comment text area
- Ratings display with evaluator information

---

## 3. User Interface

### Companies Listing Page

| Component | Description |
|-----------|-------------|
| Rating Column | Shows average company rating (stars) and count |
| View & Rate Button | Opens modal for rating company (admin/pilot) |
| Rating Form | Star selector (1-5) + comment field |

### Rating Modal

**Header**:
- Company name
- Close button (X)

**Content Sections**:
1. **Evaluations Display**
   - Average rating (large, centered)
   - Total rating count
   - Individual rating details:
     - Evaluator name
     - Evaluator role badge (Admin/Pilot)
     - Rating (stars)
     - Comment text

2. **Your Evaluation Form** (for authorized users)
   - Interactive star selector
   - Comment text area
   - Submit button

---

## 4. API Endpoints

### POST /api/companies/rate
**Submit or update a company evaluation**

**Request**:
```
URL: /api/companies/rate
Method: POST
Auth Required: Yes (Admin or Pilot)
Content-Type: application/x-www-form-urlencoded

Parameters:
- companyId (int, required): ID of the company to evaluate
- rating (int, required): Rating from 1 to 5
- ratingText (string, optional): Evaluation comment (max 50 chars)
```

**Response Success (200 OK)**:
```json
{
  "message": "Rating saved successfully",
  "rating": {
    "IdCompany": 1,
    "IdUser": 5,
    "Rating": 5,
    "RatingText": "Excellent company"
  }
}
```

**Response Errors**:
- `403 Forbidden`: User is not authorized (must be admin/pilot)
- `400 Bad Request`: Invalid parameters (missing company, rating out of range)
- `404 Not Found`: Company does not exist
- `405 Method Not Allowed`: Not a POST request

**Example cURL**:
```bash
curl -X POST http://localhost/api/companies/rate \
  -d "companyId=1&rating=5&ratingText=Great%20company"
```

### GET /api/companies/ratings
**Fetch all ratings for a company**

**Request**:
```
URL: /api/companies/ratings?companyId=1
Method: GET
Auth Required: No (optional for viewing user's own rating)

Parameters:
- companyId (int, required): ID of the company
```

**Response (200 OK)**:
```json
{
  "ratings": [
    {
      "IdCompany": 1,
      "IdUser": 5,
      "Rating": 5,
      "RatingText": "Excellent company",
      "FirstName": "John",
      "LastName": "Doe",
      "UserRole": "Admin"
    },
    {
      "IdCompany": 1,
      "IdUser": 8,
      "Rating": 4,
      "RatingText": "Good company",
      "FirstName": "Jane",
      "LastName": "Smith",
      "UserRole": "Pilot"
    }
  ],
  "averageRating": 4.5,
  "ratingCount": 2,
  "userRating": {
    "IdCompany": 1,
    "IdUser": 5,
    "Rating": 5,
    "RatingText": "Excellent company"
  }
}
```

**Response Errors**:
- `400 Bad Request`: Invalid company ID
- `404 Not Found`: Company does not exist

---

## 5. Frontend JavaScript Functionality

### Key Functions

#### Modal Management
```javascript
openCompanyModal(companyId, companyName)
// Opens modal and loads company ratings

closeCompanyModal()
// Closes the modal
```

#### Rating Operations
```javascript
loadCompanyRatings(companyId)
// Fetches and displays all ratings for a company

updateRatingDisplay(companyId)
// Updates the table rating display (stars + count)

updateStarDisplay()
// Updates the visual star selector based on selected rating
```

#### Event Listeners
- **Star hover**: Highlights stars up to hovered position
- **Star click**: Selects rating value
- **Form submit**: Validates and submits rating
- **Modal click outside**: Closes modal
- **Escape key**: Closes modal

### Star Rating Widget
- Interactive 1-5 star selector
- Hover preview before clicking
- Filled stars (★) for selected rating
- Empty stars (☆) for unselected
- Color: Gold/Yellow (#ffc107)

---

## 6. Business Logic

### Rating Submission Flow

1. **Authorization Check**
   - Verify user is logged in
   - Verify user is Admin or Pilot role

2. **Input Validation**
   - Company ID must be positive integer
   - Rating must be 1-5
   - Company must exist in database
   - Rating text optional but limited to 50 characters

3. **Database Operation**
   - Check if user already has a rating for this company
   - If exists: UPDATE the rating
   - If new: INSERT the rating

4. **Response**
   - Return saved rating with all details
   - Trigger frontend update

### Rating Display Logic

1. **Fetch all ratings** for the company from both RatingAdmin and RatingPilot tables
2. **Calculate average**: Mean of all ratings, or NULL if no ratings exist
3. **Count ratings**: Total number of evaluations
4. **Get user rating**: If logged in user has already rated, fetch it for pre-filling form
5. **Sort**: Display ratings in descending order by rating value

### Average Rating Calculation
```
Average = (Sum of Admin Ratings + Sum of Pilot Ratings) / Total Count
```

---

## 7. Security Considerations

### Authentication
- All endpoints requiring modifications (`rate`) enforce login requirement
- Session validation before processing

### Authorization  
- Only Admin and Pilot roles can submit/modify ratings
- Student and Anonymous roles can only view ratings
- Users can only see/modify their own ratings

### Input Validation
- Rating must be numeric 1-5
- Company ID validation (positive integer)
- Rating text length limit (50 characters max)
- Email/phone not accepted in rating text

### Data Protection
- Prepared SQL statements prevent injection
- HTML escaping in frontend (`escapeHtml()` function)
- CSV export handles special characters properly

### Data Integrity
- Composite primary key prevents duplicate ratings per user/company
- Foreign key constraints maintain referential integrity
- Cascade delete removes ratings when company is deleted

---

## 8. Integration with Other Features

### Related Features
- **SFx2 (Search/Display Companies)**: Integrates rating display in company table
- **SFx3 (Create Company)**: New companies start with 0 ratings
- **SFx4 (Modify Company)**: Ratings persist when company metadata changes
- **SFx6 (Delete Company)**: Associated ratings are cascade-deleted

### Data Dependencies
- Companies must exist before ratings can be created
- Admin and Pilot user accounts must exist
- No circular dependencies

---

## 9. Error Handling

### Client-Side
- JavaScript try-catch for fetch operations
- User-friendly alert messages
- Form validation before submission

### Server-Side
- HTTP status codes (400, 401, 403, 404, 405, 500)
- Exception handling with database error messages
- Logging for debugging (exceptions returned in JSON)

### Common Issues

| Issue | Solution |
|-------|----------|
| Rating not saving | Check user authentication, verify rating 1-5, check company exists |
| Average not updating | Clear browser cache, reload page |
| Modal won't open | Check browser console for errors, verify JavaScript enabled |
| Ratings not visible | Check user role permissions, verify user was logged in |

---

## 10. Testing Scenarios

### Happy Path
1. Admin logs in
2. Opens /companies
3. Clicks "View & Rate" on a company
4. Selects 5 stars, adds comment
5. Submits rating
6. Sees updated average rating
7. Refreshes page, rating persists

### Permission Tests
- Student tries to submit rating → 403 Forbidden
- Anonymous user views ratings → Can see all ratings
- Pilot updates their rating → Replaces previous rating

### Data Validation
- Submit rating 0 or 6 → 400 Bad Request
- Submit non-existent company ID → 404 Not Found
- Missing required fields → 400 Bad Request

### UI Tests
- Star hover preview works
- Modal opens/closes smoothly
- Real-time updates visible
- Escape key closes modal
- Click outside modal closes it

---

## 11. Future Enhancements

Potential improvements:
- Filter/sort by rating
- Export ratings to CSV
- Time-based rating trends
- Rating moderation system
- Rating usefulness voting (helpful/unhelpful)
- Anonymous rating option
- Rating period/date tracking
- Weighted ratings (different weights for admin vs pilot)
- Minimum character requirement for comments
- Rich text editing for comments

---

## 12. Code Examples

### Adding a Rating (JavaScript)
```javascript
const formData = new FormData();
formData.append('companyId', 1);
formData.append('rating', 5);
formData.append('ratingText', 'Excellent company!');

fetch('/NEWMVCtwigArchitecture/api/companies/rate', {
    method: 'POST',
    body: new URLSearchParams(formData)
}).then(r => r.json()).then(data => {
    console.log('Rating saved:', data);
});
```

### Fetching Ratings (JavaScript)
```javascript
fetch('/NEWMVCtwigArchitecture/api/companies/ratings?companyId=1')
    .then(r => r.json())
    .then(data => {
        console.log('Average:', data.averageRating);
        console.log('Ratings:', data.ratings);
    });
```

### Model Usage (PHP)
```php
$ratingModel = new CompanyRatingModel();

// Save a rating
$result = $ratingModel->saveRating(
    $companyId = 1,
    $userId = 5,
    $rating = 5,
    $ratingText = 'Great company',
    $userRole = 'admin'
);

// Get average
$avg = $ratingModel->getAverageRating(1);

// Get all ratings with details
$ratings = $ratingModel->getCompanyRatings(1);
```

---

## 13. File Structure

```
CESI_PROJET-WEB/
├── src/
│   ├── Controllers/
│   │   └── CompanyController.php (modified - added rate(), getRatings())
│   ├── Models/
│   │   ├── CompanyRatingModel.php (NEW - rating operations)
│   │   └── CompanyModel.php
│   └── Views/
│       └── companies.twig.html (modified - added rating UI)
├── index.php (modified - added routing)
└── DB/
    ├── CreateDB.sql (defines RatingAdmin, RatingPilot tables)
    └── Matrice_permissions_2025_V2_1.csv (defines SFx5 permissions)
```

---

## 14. Contact & Support

For questions or issues with SFx5 implementation:
- Review this documentation
- Check browser console for JavaScript errors
- Check server logs for PHP errors
- Verify database connection
- Ensure user has appropriate roles (Admin/Pilot)

