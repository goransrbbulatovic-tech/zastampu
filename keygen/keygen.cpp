/*
 * ╔═══════════════════════════════════════════════════════╗
 * ║         ZA STAMPU - License Key Generator             ║
 * ║         Kompajlirati sa:                              ║
 * ║         g++ keygen.cpp -o keygen -lssl -lcrypto       ║
 * ║         (Windows: compile with OpenSSL libs)          ║
 * ╚═══════════════════════════════════════════════════════╝
 *
 * Kako koristiti:
 *   1. Kompajliraj ovaj fajl
 *   2. Pokretni: ./keygen
 *   3. Unesi Machine ID korisnika (prikazan u aplikaciji)
 *   4. Program generiše jedinstven ključ za taj računar
 *   5. Pošalji ključ korisniku
 *
 * Ključ radi SAMO na računaru čiji je Machine ID unesen.
 * Ako korisnik promijeni računar, treba novi ključ.
 */

#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <cstring>
#include <vector>
#include <cstdint>
#include <cstdint>

// ─── SHA-256 Implementation (No external deps) ───────────────────────────────

static const uint32_t K[64] = {
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
};

#define ROTR(x,n) (((x)>>(n))|((x)<<(32-(n))))
#define CH(x,y,z) (((x)&(y))^(~(x)&(z)))
#define MAJ(x,y,z) (((x)&(y))^((x)&(z))^((y)&(z)))
#define EP0(x) (ROTR(x,2)^ROTR(x,13)^ROTR(x,22))
#define EP1(x) (ROTR(x,6)^ROTR(x,11)^ROTR(x,25))
#define SIG0(x) (ROTR(x,7)^ROTR(x,18)^((x)>>3))
#define SIG1(x) (ROTR(x,17)^ROTR(x,19)^((x)>>10))

std::string sha256(const std::string& data) {
    uint32_t h[8] = {
        0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
        0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19
    };

    std::vector<uint8_t> msg(data.begin(), data.end());
    size_t origLen = msg.size();
    msg.push_back(0x80);
    while ((msg.size() % 64) != 56) msg.push_back(0x00);
    uint64_t bitLen = (uint64_t)origLen * 8;
    for (int i = 7; i >= 0; i--) msg.push_back((uint8_t)(bitLen >> (i * 8)));

    for (size_t chunk = 0; chunk < msg.size(); chunk += 64) {
        uint32_t w[64];
        for (int i = 0; i < 16; i++) {
            w[i] = ((uint32_t)msg[chunk+i*4]<<24) | ((uint32_t)msg[chunk+i*4+1]<<16) |
                   ((uint32_t)msg[chunk+i*4+2]<<8) | (uint32_t)msg[chunk+i*4+3];
        }
        for (int i = 16; i < 64; i++)
            w[i] = SIG1(w[i-2]) + w[i-7] + SIG0(w[i-15]) + w[i-16];

        uint32_t a=h[0],b=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];
        for (int i = 0; i < 64; i++) {
            uint32_t t1 = hh + EP1(e) + CH(e,f,g) + K[i] + w[i];
            uint32_t t2 = EP0(a) + MAJ(a,b,c);
            hh=g; g=f; f=e; e=d+t1; d=c; c=b; b=a; a=t1+t2;
        }
        h[0]+=a; h[1]+=b; h[2]+=c; h[3]+=d; h[4]+=e; h[5]+=f; h[6]+=g; h[7]+=hh;
    }

    std::stringstream ss;
    for (int i = 0; i < 8; i++)
        ss << std::hex << std::setfill('0') << std::setw(8) << h[i];
    return ss.str();
}

std::string hmacSha256(const std::string& key, const std::string& message) {
    std::string k = key;
    if (k.size() > 64) k = sha256(k); // shorten if needed
    while (k.size() < 64) k += '\0';

    std::string ipad(64, '\x36'), opad(64, '\x5c');
    for (int i = 0; i < 64; i++) {
        ipad[i] ^= k[i];
        opad[i] ^= k[i];
    }
    std::string inner = sha256(ipad + message);
    // Convert hex string back to bytes for outer hash
    std::string innerBytes;
    for (size_t i = 0; i < inner.size(); i += 2) {
        uint8_t byte = (uint8_t)std::stoul(inner.substr(i, 2), nullptr, 16);
        innerBytes += (char)byte;
    }
    return sha256(opad + innerBytes);
}

// ── KEY GENERATION ────────────────────────────────────────────────────────────
const std::string SECRET = "ZaStampu@2024#PrintMaster!Key";

std::string generateKey(const std::string& machineId) {
    std::string hmac = hmacSha256(SECRET, machineId);
    // Take first 16 hex chars, format as XXXX-XXXX-XXXX-XXXX
    std::string upper = hmac.substr(0, 16);
    std::transform(upper.begin(), upper.end(), upper.begin(), ::toupper);
    return upper.substr(0,4) + "-" + upper.substr(4,4) + "-" + upper.substr(8,4) + "-" + upper.substr(12,4);
}

bool validateKey(const std::string& machineId, const std::string& key) {
    std::string expected = generateKey(machineId);
    std::string inputUpper = key;
    std::transform(inputUpper.begin(), inputUpper.end(), inputUpper.begin(), ::toupper);
    // Remove hyphens for comparison
    std::string e = expected, k = inputUpper;
    e.erase(std::remove(e.begin(), e.end(), '-'), e.end());
    k.erase(std::remove(k.begin(), k.end(), '-'), k.end());
    return e == k;
}

void printBanner() {
    std::cout << "\n";
    std::cout << "  ╔══════════════════════════════════════════╗\n";
    std::cout << "  ║       ZA STAMPU - Key Generator          ║\n";
    std::cout << "  ║       Alat za generisanje licenci        ║\n";
    std::cout << "  ╚══════════════════════════════════════════╝\n\n";
}

int main() {
    printBanner();
    
    std::string choice;
    std::cout << "  Opcije:\n";
    std::cout << "  [1] Generiši ključ za Machine ID\n";
    std::cout << "  [2] Provjeri ključ\n";
    std::cout << "  [3] Izlaz\n\n";
    std::cout << "  Odabir: ";
    std::getline(std::cin, choice);
    std::cout << "\n";

    if (choice == "1") {
        std::string machineId;
        std::cout << "  Unesi Machine ID korisnika: ";
        std::getline(std::cin, machineId);

        // Trim whitespace
        machineId.erase(0, machineId.find_first_not_of(" \t\r\n"));
        machineId.erase(machineId.find_last_not_of(" \t\r\n") + 1);
        std::transform(machineId.begin(), machineId.end(), machineId.begin(), ::toupper);

        if (machineId.empty()) {
            std::cout << "  GREŠKA: Machine ID ne može biti prazan!\n";
            return 1;
        }

        std::string key = generateKey(machineId);
        std::cout << "\n  ┌─────────────────────────────────────────┐\n";
        std::cout << "  │  Machine ID : " << machineId << std::setw(27 - (int)machineId.size()) << "│\n";
        std::cout << "  │  Ključ      : " << key << "           │\n";
        std::cout << "  └─────────────────────────────────────────┘\n\n";
        std::cout << "  ✓ Pošalji ovaj ključ korisniku.\n";
        std::cout << "  ✓ Ključ radi SAMO na tom računaru.\n\n";

    } else if (choice == "2") {
        std::string machineId, key;
        std::cout << "  Unesi Machine ID: ";
        std::getline(std::cin, machineId);
        std::cout << "  Unesi Ključ:      ";
        std::getline(std::cin, key);

        machineId.erase(0, machineId.find_first_not_of(" \t\r\n"));
        machineId.erase(machineId.find_last_not_of(" \t\r\n") + 1);
        key.erase(0, key.find_first_not_of(" \t\r\n"));
        key.erase(key.find_last_not_of(" \t\r\n") + 1);
        std::transform(machineId.begin(), machineId.end(), machineId.begin(), ::toupper);

        if (validateKey(machineId, key)) {
            std::cout << "\n  ✓ KLJUČ JE VALIDAN za ovaj Machine ID!\n\n";
        } else {
            std::cout << "\n  ✗ KLJUČ NIJE VALIDAN za ovaj Machine ID.\n";
            std::cout << "  Očekivani ključ: " << generateKey(machineId) << "\n\n";
        }
    } else {
        std::cout << "  Doviđenja!\n\n";
    }

    std::cout << "  Pritisnite Enter za izlaz...\n";
    std::string dummy; std::getline(std::cin, dummy);
    return 0;
}
