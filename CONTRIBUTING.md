# Doprinos projektu (Contributing)

Hvala na interesovanju za doprinos **Za Stampu** aplikaciji!

---

## 🐛 Prijava greške (Bug Report)

1. Provjeri da li greška već postoji u [Issues](../../issues)
2. Otvori novi Issue sa:
   - Kratkim opisom problema
   - Koracima za reprodukciju
   - Verzijom OS-a i aplikacije
   - Screenshot-om (ako je moguće)

---

## 💡 Prijedlog funkcionalnosti (Feature Request)

1. Otvori novi Issue sa labelom `enhancement`
2. Opiši šta bi željeo/željela
3. Objasni zašto bi to koristilo drugima

---

## 🔧 Pull Request

1. Forkaj repozitorij
2. Napravi granu: `git checkout -b feature/naziv-funkcionalnosti`
3. Napravi izmjene i commituj: `git commit -m 'Dodaj: kratak opis'`
4. Pushaj granu: `git push origin feature/naziv-funkcionalnosti`
5. Otvori Pull Request

### Konvencija commitova

```
Dodaj: nova funkcionalnost
Popravi: opis greške
Refaktor: opis izmjene koda
Docs: izmjena dokumentacije
Style: formatiranje, nema promjene logike
Test: dodavanje testova
```

---

## 🏗️ Lokalni razvoj

```bash
git clone https://github.com/tvoj-username/za-stampu.git
cd za-stampu
npm install
npm start
```

---

## 📁 Coding stil

- JavaScript: ES2022+, bez framework-a osim Electron-a
- C++: standard C++17, bez eksternih zavisnosti
- Komentari na bosanskom ili engleskom
- Indentacija: 2 razmaka (JS), 4 razmaka (C++)
