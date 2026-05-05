<div align="center">
  <img src="assets/icon.png" width="120" height="120" alt="Za Stampu Logo" />

  <h1>Za Stampu</h1>

  <p><strong>Desktop aplikacija za upravljanje poslovanjem štampe</strong></p>
  <p>Pratite zaradu, troškove i profit — majice, šolje, fleece i sve ostalo.</p>

  <br/>

  ![Electron](https://img.shields.io/badge/Electron-29.x-47848F?style=for-the-badge&logo=electron&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
  ![C++](https://img.shields.io/badge/C++-17-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)
  ![Platform](https://img.shields.io/badge/Windows%20%7C%20Linux-0078D6?style=for-the-badge&logo=windows&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-C9A84C?style=for-the-badge)

  <br/>

  [📦 Instalacija](#-instalacija) &nbsp;·&nbsp; [🚀 Pokretanje](#-pokretanje) &nbsp;·&nbsp; [🔑 Licenciranje](#-sistem-licenciranja) &nbsp;·&nbsp; [🛠️ Build](#%EF%B8%8F-build)

</div>

---

## ✨ Funkcionalnosti

| | Funkcija | Opis |
|---|---|---|
| 📊 | **Dashboard** | KPI kartice — zarada, troškovi, profit, marža za tekući mjesec i ukupno |
| 💰 | **Brzi unos** | Dodaj zaradu ili trošak u par klikova s kategorijom i opisom |
| 📋 | **Transakcije** | Puna lista sa filterima po tipu, datumu i kategoriji |
| 📈 | **Statistika** | Grafovi: zarada/troškovi po mjesecu, profit trend, raspodjela po kategorijama |
| 📥 | **Excel izvoz** | `.xlsx` izvještaj sa listom transakcija i poslovnim sažetkom |
| 📄 | **PDF izvoz** | Profesionalni PDF sa tabelom i sažetkom |
| 🔐 | **Licenciranje** | Ključevi vezani za konkretan računar (offline, bez servera) |

---

## 🗂️ Kategorije

**Zarada:** `Majice` · `Šolje` · `Fleece/Dukserice` · `Kačketi` · `Torbe` · `Ostalo`

**Troškovi:** `Materijal` · `Oprema` · `Reklama` · `Ostalo`

---

## 📦 Instalacija

### Zahtjevi

- [Node.js](https://nodejs.org/) **v18 LTS** ili noviji
- [Git](https://git-scm.com/)
- Za C++ keygen: `g++` s podrškom za C++17

### Kloniranje i instalacija

```bash
git clone https://github.com/tvoj-username/za-stampu.git
cd za-stampu
npm install
```

---

## 🚀 Pokretanje

```bash
# Razvojni mod
npm start

# Windows — dvostruki klik
install-windows.bat
```

---

## 🛠️ Build

### Windows `.exe` installer

```bash
npm run build:win
# → dist/Za Stampu Setup 1.0.0.exe
```

### Linux AppImage / deb

```bash
npm run build:linux
```

---

## 🔑 Sistem Licenciranja

Aplikacija koristi **HMAC-SHA256** koji veže svaki ključ za konkretan računar.

### Kako funkcioniše

```
Machine ID  = SHA256(hostname + platform + arch + CPU + username) → 16 znakova
License Key = HMAC-SHA256(SECRET, MachineID) → XXXX-XXXX-XXXX-XXXX
```

- Ključ radi **samo na računaru** za koji je generisan
- Sve je **offline** — nema servera, nema interneta
- Isti algoritam u C++ (keygen) i JavaScript (app) → identični ključevi

### Kompajliranje Key Generator-a

**Linux / Mac:**
```bash
cd keygen
g++ keygen.cpp -o keygen -std=c++17
./keygen
```

**Windows (MinGW / g++):**
```bat
build-keygen-windows.bat
```

**Windows (CMake + Visual Studio):**
```bash
cd keygen && mkdir build && cd build
cmake .. && cmake --build . --config Release
```

### Tok generisanja ključa

```
[Korisnik] Otvori aplikaciju → vidi Machine ID (npr. A1B2C3D4E5F60708)
     ↓
[Ti] Pokreneš keygen.exe → uneseš Machine ID → dobiješ ključ
     ↓
[Korisnik] Upiše ključ u aplikaciju → aktivirano! ✓
```

---

## 🏗️ Struktura projekta

```
za-stampu/
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions — auto build & release
├── assets/
│   └── icon.png               # Ikonica aplikacije
├── keygen/
│   ├── keygen.cpp             # C++17 key generator (bez eksternih zavisnosti)
│   └── CMakeLists.txt
├── renderer/
│   ├── index.html             # UI (single-page)
│   ├── styles.css             # Tamna / zlatna tema
│   └── app.js                 # Chart.js, jsPDF, xlsx logika
├── main.js                    # Electron main process + JSON baza
├── preload.js                 # IPC context bridge
├── package.json
├── install-windows.bat
├── build-windows.bat
├── build-keygen-windows.bat
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## 🔄 GitHub Actions CI/CD

Svaki push na `main` automatski:

| Korak | Opis |
|---|---|
| 🏗️ Build Windows | Kreira `.exe` NSIS installer |
| 🏗️ Build Linux | Kreira `.AppImage` i `.deb` |
| 📦 Release | Objavljuje artefakte kao GitHub Release (na tag `v*`) |

---

## 🛡️ Tehnički stack

| Komponenta | Tehnologija |
|---|---|
| Desktop framework | Electron 29.x |
| Baza podataka | JSON fajl (nema nativnih zavisnosti) |
| Grafovi | Chart.js 4.x (CDN) |
| Excel izvoz | SheetJS (xlsx) 0.18 |
| PDF izvoz | jsPDF + AutoTable (CDN) |
| Key Generator | C++17, SHA-256 HMAC bez eksternih biblioteka |
| Pakovanje | electron-builder |

---

## 🤝 Doprinos

Pogledaj [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 Licenca

MIT © Za Stampu — pogledaj [LICENSE](LICENSE).
