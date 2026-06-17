# Countdown

A static countdown timer site with a public display page and a small admin page for changing the target event configuration in the browser.

## Published Page

```text
https://numerate64.github.io/countdown/
```

## Files

- `index.html` - public countdown display.
- `admin.html` - browser-based configuration page.
- `script.js` - countdown calculation, rendering, and configuration logic.
- `styles.css` - responsive styling for the timer and controls.

## Local Preview

Open `index.html` in a browser, or serve the directory:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Notes

This is a fully static GitHub Pages app. Any configuration stored by the admin page is browser-local unless the JavaScript is extended to persist settings somewhere else.
