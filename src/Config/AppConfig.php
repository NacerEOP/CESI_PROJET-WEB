<?php

namespace App\Config;

/**
 * Application Configuration
 * Handles dynamic base path detection and configuration
 */
class AppConfig
{
    private static $basePath = null;

    /**
     * Get the base path of the application
     * Detects it dynamically from the REQUEST_URI
     * 
     * @return string The base path (e.g., '/NEWMVCtwigArchitecture' or '/')
     */
    public static function getBasePath()
    {
        if (self::$basePath !== null) {
            return self::$basePath;
        }

        // If running on localhost dev server, detect from REQUEST_URI
        $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
        
        // Remove query string
        $requestPath = parse_url($requestUri, PHP_URL_PATH);
        
        // Try to detect the base path by finding where routes start
        // Routes: /login, /signup, /browse, /dashboard, /help, /profile, /settings, etc.
        // Static: /static, /uploads, etc.
        $knownRoutes = ['login', 'signup', 'browse', 'dashboard', 'help', 'profile', 
                        'settings', 'application', 'internship', 'form', 'companies', 
                        'logout', 'home', 'api', 'upload-cv', 'static', 'uploads'];
        
        foreach ($knownRoutes as $route) {
            if (strpos($requestPath, '/' . $route) !== false) {
                // Found a known route, extract base path before it
                $pos = strpos($requestPath, '/' . $route);
                $basePath = substr($requestPath, 0, $pos);
                
                // Validate it doesn't contain suspicious patterns
                if (!empty($basePath) && strlen($basePath) < 100) {
                    self::$basePath = $basePath;
                    return self::$basePath;
                }
                break;
            }
        }
        
        // Default to root if no known route found
        self::$basePath = '';
        return self::$basePath;
    }

    /**
     * Set the base path manually (useful for testing or explicit configuration)
     * 
     * @param string $path The base path
     */
    public static function setBasePath($path)
    {
        self::$basePath = rtrim($path, '/');
    }
}
