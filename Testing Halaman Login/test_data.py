LOGIN_URL = "https://balaipensi.my.id/sso/login.php"

PASSWORD_LOCATOR = ("id", "password")
ERROR_LOCATOR = ("css", ".form-section .alert")

LOGIN_TEST_CASES = [
    {
        "case_id": "TC-LOGIN-01",
        "description": "Username kosong (validasi HTML5 required)",
        "username": "",
        "password": "password123",
        "mode": "html5_required",
        "locator": ("id", "username"),
        "expected": "",
    },
    {
        "case_id": "TC-LOGIN-02",
        "description": "Kredensial salah",
        "username": "user_salah",
        "password": "passwordSalah123",
        "mode": "text",
        "locator": ERROR_LOCATOR,
        "expected": "NIP / Username atau Kata Sandi tidak valid!",
    },
    {
        "case_id": "TC-LOGIN-03",
        "description": "Autentikasi sukses",
        "username": "VALIDUSERNAME",
        "password": "VALIDPASSWORD",
        "mode": "url",
        "locator": None,
        "expected": "dashboard.php",  
    },
]