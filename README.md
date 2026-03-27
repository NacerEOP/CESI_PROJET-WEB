# CESI_PROJET-WEB
A full frontend-backend for finding internships using MVC architecture (Model-View-Controller).




Nacer/ Home, Help, Support

Leith/ Browse, Interniship

Yanis/ Login, Signup, Settings

Racim/ Application Profile 



# MVC Internship Platform

This is the restructured project using MVC architecture with Twig templating.

## Setup Instructions

1. Install dependencies:
   ```bash
   composer install
   ```

2. Copy static files from the original project:
   - Copy all files from `../src/styles/` to `static/styles/`
   - Copy all files from `../src/js/` to `static/js/`
   - Copy all files from `../src/assets/` to `static/assets/`
   - Copy all files from `../src/shaders/` to `static/shaders/`
   - Copy all files from `../src/uploads/` to `static/uploads/`

3. Start a PHP development server from this folder **using `index.php` as the router** so that asset requests are handled correctly. For example:
   ```bash
   # run from inside NEWMVCtwigArchitecture
   php -S localhost:8000 index.php
   ```
   This ensures every request (including `/static/...` paths) goes through the router logic that strips the `/NEWMVCtwigArchitecture` prefix.

4. Access the application at: `http://localhost:8000/NEWMVCtwigArchitecture/` (or simply `http://localhost:8000/` if you prefer to remove the prefix entirely).
## Project Structure

- `index.php` - Entry point and router
- `src/Controllers/` - Controller classes
- `src/Models/` - Data models
- `templates/` - Twig templates
- `static/` - Static assets (CSS, JS, images, etc.)
- `data/` - JSON data files

## Routes

- `/` or `/home` - Home page
- `/browse` - Browse internships
- `/api/internships` - JSON API for internships
- Other pages: dashboard, help, login, signup, profile, settings, application, internship, form

A2-project