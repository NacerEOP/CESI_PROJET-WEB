# SFx5 – Developer Quick Reference

## Quick Links

| Component | File | Purpose |
|-----------|------|---------|
| Model | `src/Models/CompanyRatingModel.php` | Database operations for ratings |
| Controller | `src/Controllers/CompanyController.php` | API endpoints for rating |
| View | `src/Views/companies.twig.html` | UI for companies and ratings |
| Routes | `index.php` | API routing |
| Docs | `SFx5_EVALUATION_DOCUMENTATION.md` | Full technical documentation |

---

## Model Methods Reference

### CompanyRatingModel

```php
// Save or update a rating
$result = $ratingModel->saveRating($companyId, $userId, $rating, $ratingText, $userRole);
// Returns: array with rating data or false

// Get a specific user's rating
$rating = $ratingModel->getRating($companyId, $userId, $userRole);
// Returns: array with rating data or null

// Get average rating for company
$avg = $ratingModel->getAverageRating($companyId);
// Returns: float or null

// Get all ratings with user details
$ratings = $ratingModel->getCompanyRatings($companyId);
// Returns: array of ratings

// Count total ratings
$count = $ratingModel->getRatingCount($companyId);
// Returns: int

// Delete a rating
$deleted = $ratingModel->deleteRating($companyId, $userId, $userRole);
// Returns: bool
```

---

## Controller Methods Reference

### CompanyController

#### rate() - POST /api/companies/rate
Submit or update a company evaluation

**Requirements**:
- Session must be active
- User must be Admin or Pilot
- Request method must be POST

**Parameters**:
```php
$_POST['companyId']   // int, required
$_POST['rating']      // int 1-5, required
$_POST['ratingText']  // string (max 50), optional
```

**Returns**:
```php
// Success (200)
['message' => '...', 'rating' => [...]]

// Error (400, 403, 404, 405, 500)
['error' => '...']
```

#### getRatings() - GET /api/companies/ratings
Fetch ratings for a company

**Parameters**:
```php
$_GET['companyId']  // int, required
```

**Returns**:
```php
[
    'ratings' => [...],
    'averageRating' => 4.5,
    'ratingCount' => 2,
    'userRating' => [...] // if authenticated
]
```

---

## JavaScript Functions Reference

### Modal Management
```javascript
openCompanyModal(companyId, companyName)
closeCompanyModal()
```

### Rating Operations
```javascript
loadCompanyRatings(companyId)
updateRatingDisplay(companyId)
updateStarDisplay()
```

### Event Handlers
```javascript
// Star rating
document.querySelectorAll('#ratingStars .star')
  .addEventListener('click', ...)
  .addEventListener('mouseover', ...)

// Form submission
document.getElementById('ratingForm')
  .addEventListener('submit', ...)
```

---

## Database Queries

### Insert Rating
```sql
INSERT INTO RatingAdmin (IdCompany, IdUser, Rating, RatingText)
VALUES (?, ?, ?, ?)
```

### Update Rating
```sql
UPDATE RatingAdmin
SET Rating = ?, RatingText = ?
WHERE IdCompany = ? AND IdUser = ?
```

### Get Average Rating
```sql
SELECT AVG(Rating) as avg_rating
FROM RatingAdmin
WHERE IdCompany = ?
```

### Get All Ratings with User Info
```sql
SELECT r.*, u.FirstName, u.LastName
FROM RatingAdmin r
JOIN Admin a ON r.IdUser = a.IdUser
JOIN Users u ON a.IdUser = u.IdUser
WHERE r.IdCompany = ?
ORDER BY r.Rating DESC
```

---

## Common Tasks

### Add Star Rating Filter
```javascript
// In loadCompanyRatings callback:
const minRating = 4;
const filtered = data.ratings.filter(r => r.Rating >= minRating);
```

### Export Ratings to CSV
```php
$ratings = $ratingModel->getCompanyRatings($companyId);
header('Content-Type: text/csv');
foreach ($ratings as $rating) {
    echo "{$rating['FirstName']},{$rating['LastName']},{$rating['Rating']}\n";
}
```

### Change Rating Scale (e.g., 1-10)
1. Modify validation in controller: `$rating > 10` instead of `$rating > 5`
2. Change SQL column: `TINYINT` → `SMALLINT`
3. Update star widget to use 10 stars instead of 5

### Add Rating Moderation
```php
// In CompanyRatingModel:
public function flagRating($companyId, $userId, $reason) {
    // Save to moderation queue
}
```

---

## Validation Rules

### Rating Value
- Type: integer
- Range: 1-5
- Required: yes

### Company ID
- Type: integer
- Must exist: yes
- Required: yes

### Rating Text
- Type: string
- Max length: 50 characters
- Required: no
- XSS protection: applied

---

## Error Messages

| Code | Message | Cause |
|------|---------|-------|
| 400 | Rating must be between 1 and 5 | Invalid rating value |
| 400 | Invalid company ID | Non-integer or missing company ID |
| 401 | Unauthorized | User not logged in |
| 403 | Forbidden - Only Admin and Pilot can rate | Wrong user role |
| 404 | Company not found | Company doesn't exist |
| 405 | Method not allowed | Wrong HTTP method |
| 500 | Database error: ... | SQL error |

---

## Security Checklist

When modifying this feature, ensure:

- [ ] All user inputs validated before use
- [ ] Prepared statements used (no string concatenation in SQL)
- [ ] Role-based access control enforced
- [ ] HTTP status codes are appropriate
- [ ] Sensitive errors logged but not exposed to user
- [ ] HTML/JavaScript escaped properly
- [ ] CSRF tokens if needed (check framework)
- [ ] Rate limiting if needed
- [ ] SQL injection prevention verified

---

## Performance Tips

### Database Optimization
```php
// ❌ Bad: N+1 queries
foreach ($companies as $company) {
    $avg = $ratingModel->getAverageRating($company['id']);
}

// ✅ Good: Single query with join
$stmt = $db->prepare('
    SELECT c.*, AVG(r.Rating) as avg_rating
    FROM Companies c
    LEFT JOIN RatingAdmin r ON c.IdCompany = r.IdCompany
    GROUP BY c.IdCompany
');
```

### Frontend Optimization
```javascript
// ❌ Bad: Load on every interaction
button.addEventListener('click', () => {
    fetch('/api/companies/ratings?companyId=' + id);
});

// ✅ Good: Cache results
const cache = {};
function loadRatings(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    return fetch(...).then(r => { cache[id] = r; return r; });
}
```

---

## Testing Guide

### Unit Tests (PHP)
```php
public function testSaveRating() {
    $model = new CompanyRatingModel();
    $result = $model->saveRating(1, 5, 5, 'Great!', 'admin');
    $this->assertNotFalse($result);
    $this->assertEquals($result['Rating'], 5);
}
```

### Integration Tests (API)
```javascript
async function testRatingAPI() {
    // Submit rating
    const response = await fetch('/api/companies/rate', {
        method: 'POST',
        body: new URLSearchParams({...})
    });
    console.assert(response.ok);
    
    // Verify saved
    const ratings = await fetch('/api/companies/ratings?companyId=1');
    console.assert(ratings.userRating !== null);
}
```

---

## Extending the Feature

### Add Rich Text Comments
```php
// In saveRating, process Markdown:
$ratingText = parseMarkdown($_POST['ratingText']);
```

### Add Rating Weights
```php
// Admin ratings count as 1.5x
SELECT AVG(IF(UserRole='admin', Rating*1.5, Rating))
```

### Add Rating Timeline
```sql
ALTER TABLE RatingAdmin ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### Add Rating History
```php
public function getRatingHistory($companyId, $limit = 10) {
    $stmt = $this->db->prepare('
        SELECT * FROM RatingAdmin
        WHERE IdCompany = ?
        ORDER BY created_at DESC
        LIMIT ?
    ');
    return $stmt->fetchAll();
}
```

---

## Debugging Tips

### Check if Rating Saved
```php
$rating = $ratingModel->getRating($companyId, $userId, 'admin');
var_dump($rating); // Should show array or null
```

### Check Database Connection
```php
try {
    $result = $ratingModel->getCompanyRatings(1);
    echo "Connected";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

### Check JavaScript Errors
```javascript
window.addEventListener('error', (e) => {
    console.error('JS Error:', e.message);
    console.error('Stack:', e.stack);
});
```

### Monitor API Calls
```javascript
// Open DevTools → Network tab
// Filter by 'companies'
// Check request/response payloads
```

---

## Maintenance Checklist

Regular maintenance tasks:

- [ ] Monitor for SQL errors in logs
- [ ] Check for abandoned ratings (no company)
- [ ] Verify average ratings are accurate
- [ ] Update documentation if features change
- [ ] Review permission matrix regularly
- [ ] Test rating system after updates
- [ ] Backup rating data regularly
- [ ] Monitor database performance

---

## Related Classes/Functions

```php
// CompanyModel
$company = $model->getById($id);

// Auth
Auth::hasRole(['admin', 'pilot'])
Auth::user()

// Database
Database::getInstance()->getConnection()
```

---

## File Locations

```
d:\CESI_PROJET-WEB\
├── src/
│   ├── Controllers/CompanyController.php
│   ├── Models/
│   │   ├── CompanyRatingModel.php
│   │   ├── CompanyModel.php
│   │   ├── Auth.php
│   │   └── Database.php
│   └── Views/companies.twig.html
├── index.php
├── DB/
│   ├── CreateDB.sql
│   └── Matrice_permissions_2025_V2_1.csv
├── SFx5_EVALUATION_DOCUMENTATION.md
└── SFx5_IMPLEMENTATION_SUMMARY.md
```

---

## Quick Copy-Paste Templates

### Add to a New Controller
```php
use App\Models\CompanyRatingModel;

private $ratingModel;

public function __construct() {
    parent::__construct();
    $this->ratingModel = new CompanyRatingModel();
}

public function rateCompany() {
    $result = $this->ratingModel->saveRating(...);
    // Handle result
}
```

### Add API Route
```php
case '/api/companies/rate':
    requireAuth();
    $controller = new CompanyController();
    $controller->rate();
    break;
```

### Add Modal Trigger in HTML
```html
<button onclick="openCompanyModal({{ id }}, '{{ name }}')">
    View & Rate
</button>
```

---

**Last Updated**: 2026-03-28  
**Feature**: SFx5 - Évaluer une entreprise  
**Status**: Complete & Production Ready
