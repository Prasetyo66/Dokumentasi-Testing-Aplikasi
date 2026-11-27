from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BY_MAP = {
    "id": By.ID,
    "name": By.NAME,
    "css": By.CSS_SELECTOR,
    "xpath": By.XPATH,
}


class LoginKeywords:
    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def _locate(self, by_type, value):
        return (BY_MAP[by_type], value)

    # --- Low-Level Keywords (Test Interface Layer) ---
    def open_login_page(self, url):
        self.driver.get(url)

    def set_text(self, by_type, locator_value, value):
        field = self.wait.until(
            EC.visibility_of_element_located(self._locate(by_type, locator_value))
        )
        field.clear()
        field.send_keys(value)

    def click(self, by_type, locator_value):
        button = self.wait.until(
            EC.element_to_be_clickable(self._locate(by_type, locator_value))
        )
        button.click()

    def get_validation_message(self, by_type, locator_value):
        field = self.wait.until(
            EC.visibility_of_element_located(self._locate(by_type, locator_value))
        )
        return field.get_attribute("validationMessage")

    def verify_text(self, by_type, locator_value, expected_text):
        elem = self.wait.until(
            EC.visibility_of_element_located(self._locate(by_type, locator_value))
        )
        assert expected_text in elem.text, (
            f"Expected '{expected_text}' in '{elem.text}'"
        )

    def verify_url_contains(self, expected_fragment):
        self.wait.until(EC.url_contains(expected_fragment))
        assert expected_fragment in self.driver.current_url, (
            f"Expected '{expected_fragment}' in URL '{self.driver.current_url}'"
        )

    # --- Composite Keyword (Domain Layer) ---
    def login_user(self, username, password, password_locator=("id", "password")):
        self.set_text("id", "username", username)
        self.set_text(password_locator[0], password_locator[1], password)
        self.click("css", "form button[type='submit']")