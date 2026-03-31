<?php

namespace Tests\Controllers;

use PHPUnit\Framework\TestCase;
use App\Controllers\ApplicationController;
use App\Controllers\BrowseController;
use App\Controllers\CompanyController;
use App\Controllers\DashboardController;
use App\Controllers\FormController;
use App\Controllers\HelpController;
use App\Controllers\HomeController;
use App\Controllers\InternshipController;
use App\Controllers\LoginController;
use App\Controllers\PilotController;
use App\Controllers\ProfileController;
use App\Controllers\SettingsController;
use App\Controllers\SignupController;
use App\Controllers\StudentController;
use App\Controllers\WishListController;
use App\Models\CompanyModel;

class ControllersTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Avoid running session_start() inside setUp because CLI test harness may already send headers.
        $_SESSION = [];
        $_SERVER['REQUEST_METHOD'] = 'GET';
        http_response_code(200);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $_SESSION = [];
        $_SERVER['REQUEST_METHOD'] = 'GET';
        http_response_code(200);
    }

    /**
     * @dataProvider simpleIndexControllerProvider
     */
    public function testSimpleIndexControllersRenderTemplate(string $controllerClass, string $expectedTemplate)
    {
        $controller = $this->getMockBuilder($controllerClass)
            ->disableOriginalConstructor()
            ->onlyMethods(['render'])
            ->getMock();

        $controller->expects($this->once())
            ->method('render')
            ->with($expectedTemplate, $this->arrayHasKey('title'));

        $controller->index();
    }

    public function simpleIndexControllerProvider(): array
    {
        return [
            [ApplicationController::class, 'application'],
            [BrowseController::class, 'browse'],
            [FormController::class, 'form'],
            [HelpController::class, 'help'],
            [HomeController::class, 'home'],
            [LoginController::class, 'login'],
            [ProfileController::class, 'profile'],
            [SettingsController::class, 'settings'],
            [SignupController::class, 'signup'],
            [InternshipController::class, 'internship'],
        ];
    }

    public function testCompanyIndexRendersTemplateWithModelAndNoAuth()
    {
        $_SESSION = []; // no user, should skip Auth role checks

        $controller = $this->getMockBuilder(CompanyController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['render'])
            ->getMock();

        $model = $this->createMock(CompanyModel::class);
        $model->method('getAll')->willReturn([]);
        $model->method('getAllCountries')->willReturn([]);
        $model->method('search')->willReturn([]);

        $ref = new \ReflectionClass(CompanyController::class);
        $propModel = $ref->getProperty('model');
        $propModel->setAccessible(true);
        $propModel->setValue($controller, $model);

        $controller->expects($this->once())
            ->method('render')
            ->with('companies', $this->arrayHasKey('title'));

        $controller->index();
    }

    public function testDashboardIndexMethodExists()
    {
        $this->assertTrue(method_exists(DashboardController::class, 'index'));
    }

    public function testPilotIndexReturnsForbiddenWithoutAdmin()
    {
        $_SESSION['user'] = ['id' => 1, 'role' => 'student'];

        $controller = $this->getMockBuilder(PilotController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['render'])
            ->getMock();

        $controller->expects($this->never())->method('render');

        $controller->index();

        $this->assertSame(403, http_response_code());
    }

    public function testStudentIndexReturnsForbiddenWithoutAdminOrPilot()
    {
        $_SESSION['user'] = ['id' => 1, 'role' => 'student'];

        $controller = $this->getMockBuilder(StudentController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['render'])
            ->getMock();

        $controller->expects($this->never())->method('render');

        $controller->index();

        $this->assertSame(403, http_response_code());
    }

    public function testWishListIndexReturnsForbiddenWithoutStudent()
    {
        $_SESSION['user'] = ['id' => 1, 'role' => 'pilot'];

        $controller = $this->getMockBuilder(WishListController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['render'])
            ->getMock();

        $controller->expects($this->never())->method('render');

        $controller->index();

        $this->assertSame(403, http_response_code());
    }

    public function testHelpLegalRendersLegalTemplate()
    {
        $controller = $this->getMockBuilder(HelpController::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['render'])
            ->getMock();

        $controller->expects($this->once())
            ->method('render')
            ->with('legal', $this->arrayHasKey('title'));

        $controller->legal();
    }
}
