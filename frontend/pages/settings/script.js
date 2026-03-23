(function () {
	const USERNAME_COLORS = {
		RED: "#dc3545",
		ORANGE: "#fd7e14",
		YELLOW: "#d4a017",
		GREEN: "#198754",
		BLUE: "#0d6efd",
		PURPLE: "#6f42c1",
		BLACK: "#111111"
	};

	const settingsAlert = document.getElementById("settingsAlert");
	const newsletterOptIn = document.getElementById("newsletterOptIn");
	const usernameColor = document.getElementById("usernameColor");
	const usernamePreview = document.getElementById("usernamePreview");
	const saveSettingsBtn = document.getElementById("saveSettingsBtn");
	const logoutBtn = document.getElementById("logoutBtn");

	function showAlert(message, type = "danger") {
		settingsAlert.className = `alert alert-${type} mb-4`;
		settingsAlert.textContent = message;
		settingsAlert.classList.remove("d-none");
	}

	function hideAlert() {
		settingsAlert.classList.add("d-none");
	}

	function setButtonLoading(button, isLoading, label) {
		button.disabled = isLoading;
		button.textContent = isLoading ? label : button.dataset.label;
	}

	function renderPreview() {
		const selectedColor = usernameColor.value;
		usernamePreview.style.color = USERNAME_COLORS[selectedColor] || USERNAME_COLORS.BLACK;
	}

	async function ensureUser() {
		if (!localStorage.getItem("token")) {
			window.loadPageByPath("/auth");
			return null;
		}

		if (window.MentalPanda.userLoadPromise) {
			await window.MentalPanda.userLoadPromise;
		} else {
			window.MentalPanda.userLoadPromise = window.MentalPanda.loadUser();
			await window.MentalPanda.userLoadPromise;
		}

		if (!window.MentalPanda.user) {
			window.loadPageByPath("/auth");
			return null;
		}

		return window.MentalPanda.user;
	}

	function populateForm(user) {
		const settings = user.settings || {};
		newsletterOptIn.checked = Boolean(settings.signedUpForNewsletter);
		usernameColor.value = settings.usernameColor || "BLACK";
		usernamePreview.textContent = user.username || "Your username";
		renderPreview();
	}

	async function saveSettings() {
		hideAlert();
		setButtonLoading(saveSettingsBtn, true, "Saving...");

		try {
			const updates = [
				{ key: "signedUpForNewsletter", value: newsletterOptIn.checked },
				{ key: "usernameColor", value: usernameColor.value }
			];

			const responses = await Promise.all(
				updates.map((update) => window.MentalPanda.fetch("/api/update-settings", {
					method: "POST",
					body: update
				}))
			);

			const payloads = await Promise.all(responses.map((response) => response.json()));
			const failedResponseIndex = responses.findIndex((response) => !response.ok);

			if (failedResponseIndex !== -1) {
				throw new Error(payloads[failedResponseIndex]?.error || "Unable to save settings.");
			}

			window.MentalPanda.user = {
				...window.MentalPanda.user,
				settings: {
					...(window.MentalPanda.user?.settings || {}),
					signedUpForNewsletter: newsletterOptIn.checked,
					usernameColor: usernameColor.value
				}
			};

			showAlert("Settings saved.", "success");
		} catch (error) {
			showAlert(error.message || "Unable to save settings right now.");
		} finally {
			setButtonLoading(saveSettingsBtn, false, "Saving...");
		}
	}

	async function logout() {
		hideAlert();
		setButtonLoading(logoutBtn, true, "Logging out...");

		try {
			await window.MentalPanda.fetch("/api/logout", { method: "POST" });
		} finally {
			window.MentalPanda.disconnectSocket();
			localStorage.removeItem("token");
			window.MentalPanda.user = null;
			window.MentalPanda.userLoadPromise = null;
			window.loadPageByPath("/auth");
		}
	}

	usernameColor.addEventListener("change", renderPreview);
	saveSettingsBtn.addEventListener("click", saveSettings);
	logoutBtn.addEventListener("click", logout);

	ensureUser().then((user) => {
		if (user) {
			populateForm(user);
		}
	});
})();
