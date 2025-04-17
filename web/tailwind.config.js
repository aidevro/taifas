module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                zoomBlue: "#0E72ED",
                zoomWhite: "#FFFFFF",
                zoomGray: "#E5E7EB",
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
