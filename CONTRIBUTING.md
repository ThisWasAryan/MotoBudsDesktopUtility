# Contributing to Moto Buds Desktop Utility

First off, thank you for considering contributing to Moto Buds Desktop Utility! It's people like you that make open-source software such a great community.

## 🧪 Testing on Different Hardware

This application and its reverse-engineered Bluetooth protocol were developed and strictly tested exclusively against the **Moto Buds Bass(India Only Model)**. 

### We Need Moto Buds+ Testers!
If you own the **Moto Buds+**, we highly encourage you to test the application! Because the underlying Bluetooth opcodes might differ slightly between the base model and the "Plus" model (especially concerning Spatial Audio and advanced ANC modes), community testing is the only way we can guarantee 100% feature parity.

If you test the app on a Moto Buds+ and encounter a bug (or if everything works perfectly!), please open an Issue to let us know.

## 🐛 Reporting Bugs

If you find a bug, please use the provided **Bug Report** issue template. Before opening a new issue, please:
1. Search existing issues to ensure it hasn't already been reported.
2. Make sure you are running the latest version from the Releases page.
3. If reporting a protocol or connection issue, try running the python backend manually in a terminal to provide the stack trace.

## ✨ Suggesting Enhancements

If you have an idea for a new feature, please use the **Feature Request** issue template. Explain what the feature is, why it would be useful, and how you envision it working within the desktop UI.

## 💻 Pull Requests

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes (`npm run build`).
4. Keep your PRs focused. If you have multiple unrelated changes, submit them as separate Pull Requests.
5. Provide a clear and descriptive PR title and description.
