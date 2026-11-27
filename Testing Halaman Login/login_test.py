from datetime import datetime
from selenium import webdriver
from keywords import LoginKeywords
from test_data import LOGIN_URL, LOGIN_TEST_CASES


def run_tests():
    driver = webdriver.Chrome()
    driver.maximize_window()
    kw = LoginKeywords(driver, timeout=10)

    try:
        for tc in LOGIN_TEST_CASES:
            start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            step = "open_login_page"
            try:
                kw.open_login_page(LOGIN_URL)

                if tc["mode"] == "html5_required":
                    if tc.get("password"):
                        step = "set_password"
                        kw.set_text("id", "password", tc["password"])
                    step = "click_submit"
                    kw.click("css", "form button[type='submit']")
                    step = "get_validation_message"
                    msg = kw.get_validation_message(tc["locator"][0], tc["locator"][1])
                    assert msg != "", "Tooltip validasi HTML5 tidak muncul"
                    print(f"[PASS] [{start_time}] {tc['case_id']} - Pesan validasi: '{msg}'")
                else:
                    step = "login_user"
                    kw.login_user(tc["username"], tc["password"])
                    if tc["mode"] == "text":
                        step = "verify_text"
                        kw.verify_text(tc["locator"][0], tc["locator"][1], tc["expected"])
                    elif tc["mode"] == "url":
                        step = "verify_url"
                        kw.verify_url_contains(tc["expected"])
                    print(f"[PASS] [{start_time}] {tc['case_id']} - {tc['description']}")

            except AssertionError as err:
                print(f"[FAIL] [{start_time}] {tc['case_id']} ({step}) - {err}")
            except Exception as err:
                short_msg = str(err).splitlines()[0] if str(err) else type(err).__name__
                print(f"[BLOCKED/ERROR] [{start_time}] {tc['case_id']} ({step}) - {short_msg}")
    finally:
        driver.quit()


if __name__ == "__main__":
    run_tests()