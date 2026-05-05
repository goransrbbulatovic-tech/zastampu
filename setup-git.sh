#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  ZA STAMPU — Git inicijalizacija i push na GitHub
#  Pokretanje: bash setup-git.sh
# ═══════════════════════════════════════════════════════════════

set -e

# Boje za output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GOLD='\033[0;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${GOLD}  ╔══════════════════════════════════════════╗${NC}"
echo -e "${GOLD}  ║    ZA STAMPU — GitHub Setup Skripta     ║${NC}"
echo -e "${GOLD}  ╚══════════════════════════════════════════╝${NC}"
echo ""

# ─── PROVJERA ZAHTJEVA ───────────────────────────────────────
echo -e "${BLUE}[1/5]${NC} Provjera zahtjeva..."

if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git nije instaliran! https://git-scm.com${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js nije instaliran! https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Git: $(git --version)${NC}"
echo -e "${GREEN}✓ Node: $(node --version)${NC}"

# ─── GITHUB USERNAME ─────────────────────────────────────────
echo ""
echo -e "${BLUE}[2/5]${NC} GitHub podaci"
echo ""
read -p "  Tvoj GitHub username: " GITHUB_USER
read -p "  Naziv repozitorija (default: za-stampu): " REPO_NAME
REPO_NAME=${REPO_NAME:-za-stampu}

echo ""
echo -e "  Repozitorij će biti: ${GOLD}https://github.com/${GITHUB_USER}/${REPO_NAME}${NC}"
echo ""
read -p "  Nastaviti? (y/n): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Otkazano."
    exit 0
fi

# ─── GIT INIT ────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[3/5]${NC} Inicijalizacija Git repozitorija..."

if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✓ Git repo inicijaliziran${NC}"
else
    echo -e "${YELLOW}⚠ Git repo već postoji${NC}"
fi

git add .
git commit -m "Initial commit: Za Stampu v1.0.0

- Electron desktop aplikacija za stamparsku radnju
- Dashboard s KPI karticama (zarada, troškovi, profit, marža)
- Brzi unos transakcija s kategorijama
- Pregled transakcija s filterima
- Statistika s grafovima (Chart.js)
- Izvoz u Excel (.xlsx) i PDF
- C++ key generator (HMAC-SHA256, offline licenciranje)
- GitHub Actions CI/CD za auto-build
" 2>/dev/null || echo -e "${YELLOW}⚠ Nema novih promjena za commit${NC}"

echo -e "${GREEN}✓ Commit napravljen${NC}"

# ─── REMOTE ──────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[4/5]${NC} Postavljanje GitHub remote-a..."

REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

if git remote get-url origin &> /dev/null 2>&1; then
    git remote set-url origin "$REMOTE_URL"
    echo -e "${YELLOW}⚠ Remote origin ažuriran${NC}"
else
    git remote add origin "$REMOTE_URL"
    echo -e "${GREEN}✓ Remote origin dodan${NC}"
fi

echo -e "  URL: ${GOLD}${REMOTE_URL}${NC}"

# ─── PUSH ────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[5/5]${NC} Push na GitHub..."
echo ""
echo -e "${YELLOW}VAŽNO: Provjeri da li si kreirao/la repozitorij na GitHub-u!${NC}"
echo -e "  → Idi na: ${GOLD}https://github.com/new${NC}"
echo -e "  → Naziv: ${GOLD}${REPO_NAME}${NC}"
echo -e "  → Vidljivost: Public ili Private (tvoj izbor)"
echo -e "  → NE dodavaj README, .gitignore ili LICENSE"
echo ""
read -p "  Da li si kreirao/la repozitorij? (y/n): " CREATED

if [[ "$CREATED" == "y" || "$CREATED" == "Y" ]]; then
    git branch -M main
    git push -u origin main

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  ✓ USPJEŠNO PUSH-OVANO NA GITHUB!${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
        echo ""
        echo -e "  🔗 Repozitorij: ${GOLD}https://github.com/${GITHUB_USER}/${REPO_NAME}${NC}"
        echo -e "  ⚙️  Actions:    ${GOLD}https://github.com/${GITHUB_USER}/${REPO_NAME}/actions${NC}"
        echo -e "  📦 Releases:   ${GOLD}https://github.com/${GITHUB_USER}/${REPO_NAME}/releases${NC}"
        echo ""
        echo -e "  ${YELLOW}Sljedeći koraci:${NC}"
        echo -e "  1. GitHub Actions će automatski početi build"
        echo -e "  2. Za release, napravi tag: ${GOLD}git tag v1.0.0 && git push origin v1.0.0${NC}"
        echo -e "  3. Release će biti dostupan na Releases stranici"
    else
        echo -e "${RED}✗ Push nije uspio. Provjeri da je repozitorij kreiran i da imaš pristup.${NC}"
    fi
else
    echo ""
    echo -e "  Kada kreirate repozitorij, pokrenite:"
    echo -e "  ${GOLD}git push -u origin main${NC}"
fi

echo ""
