(function () {
    // ── Elements ──────────────────────────────────────────
    const tabLogin     = document.getElementById("tab-login");
    const tabRegister  = document.getElementById("tab-register");
    const formLogin    = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const authAlert    = document.getElementById("authAlert");
    const loginForm    = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const switchToReg  = document.getElementById("switchToRegister");
    const switchToLog  = document.getElementById("switchToLogin");

    // ── Helpers ───────────────────────────────────────────
    function showAlert(message, type = "danger") {
        authAlert.className = `alert alert-${type}`;
        authAlert.textContent = message;
        authAlert.classList.remove("d-none");
    }

    function hideAlert() {
        authAlert.classList.add("d-none");
    }

    function setLoading(btn, loading) {
        btn.disabled = loading;
        btn.textContent = loading ? "Please wait..." : btn.dataset.label;
    }

    function showTab(tab) {
        hideAlert();
        if (tab === "login") {
            formLogin.classList.remove("d-none");
            formRegister.classList.add("d-none");
            tabLogin.classList.add("active");
            tabRegister.classList.remove("active");
        } else {
            formRegister.classList.remove("d-none");
            formLogin.classList.add("d-none");
            tabRegister.classList.add("active");
            tabLogin.classList.remove("active");
        }
    }

    // ── Password toggles ──────────────────────────────────
    document.querySelectorAll(".toggle-pw").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            input.type = input.type === "password" ? "text" : "password";
            btn.textContent = input.type === "password" ? "👁" : "🙈";
        });
    });

    // ── Tab switching ─────────────────────────────────────
    tabLogin.addEventListener("click",    () => showTab("login"));
    tabRegister.addEventListener("click", () => showTab("register"));
    switchToReg.addEventListener("click", (e) => { e.preventDefault(); showTab("register"); });
    switchToLog.addEventListener("click", (e) => { e.preventDefault(); showTab("login"); });

    // ── Login ─────────────────────────────────────────────
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAlert();

        const email    = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const btn      = document.getElementById("loginBtn");

        if (!email || !password) {
            return showAlert("Please fill in all fields.");
        }

        setLoading(btn, true);

        try {
            const res  = await window.MentalPanda.fetch("/api/login", {
                method: "POST",
                body: { email, password }
            });
            const data = await res.json();

            if (!res.ok) {
                return showAlert(data.error || "Login failed.");
            }

            localStorage.setItem("token", data.token);
            window.MentalPanda.userLoadPromise = window.MentalPanda.loadUser();
            await window.MentalPanda.userLoadPromise;
            showAlert("Logged in successfully! Redirecting...", "success");
            setTimeout(() => window.loadPageByPath("/settings"), 2000);
        } catch {
            showAlert("Something went wrong. Please try again.");
        } finally {
            setLoading(btn, false);
        }
    });

    // ── Register ──────────────────────────────────────────
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAlert();

        const username = document.getElementById("regUsername").value.trim();
        const email    = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const confirm  = document.getElementById("regConfirm").value;
        const btn      = document.getElementById("registerBtn");

        if (!username || !email || !password || !confirm) {
            return showAlert("Please fill in all fields.");
        }

        if (password !== confirm) {
            return showAlert("Passwords do not match.");
        }

        if (password.length < 8) {
            return showAlert("Password must be at least 8 characters.");
        }

        setLoading(btn, true);

        try {
            const res  = await window.MentalPanda.fetch("/api/register", {
                method: "POST",
                body: { username, email, password }
            });
            const data = await res.json();

            if (!res.ok) {
                return showAlert(data.error || "Registration failed.");
            }

            localStorage.setItem("token", data.token);
            window.MentalPanda.userLoadPromise = window.MentalPanda.loadUser();
            await window.MentalPanda.userLoadPromise;
            showAlert("Account created! Redirecting...", "success");
            setTimeout(() => window.loadPageByPath("/settings"), 2000);
        } catch {
            showAlert("Something went wrong. Please try again.");
        } finally {
            setLoading(btn, false);
        }
    });
})();
