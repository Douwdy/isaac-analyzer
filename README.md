# 💀 Isaac Savefile Analyzer 👁️

Un analyseur web complet pour vos sauvegardes **The Binding of Isaac: Rebirth** et ses DLC.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)

## ✨ Caractéristiques

### 📊 Analyse Complète
- **Statistiques générales** : Runs totaux, victoires, morts, temps de jeu
- **Taux de victoire** : Calcul automatique et affichage visuel
- **Progression personnages** : État de déverrouillage de chaque character
- **Déverrouillages** : Boss Rush, Mega Satan, Ultra Greed, Hush, Mother, Mother Queen

### 🎮 Support Multi-DLC
- ✅ **Rebirth** - Jeu de base
- ✅ **Afterbirth** - DLC 1
- ✅ **Repentance** - DLC majeur
- ✅ **Repentance+** - DLC 2

### 🎨 Interface Premium
- **Thème sombre et mystérieux** inspiré de l'univers Isaac
- **Design réactif** - Fonctionne parfaitement sur mobile, tablette et desktop
- **Animations fluides** - Transitions et effets visuels soignés
- **Interface intuitive** - Facile à utiliser pour tous les niveaux

### 🔐 Sécurité
- **Traitement local** - Vos données ne quittent jamais votre ordinateur
- **Pas de serveur** - Aucune donnée stockée sur nos serveurs
- **Open source** - Code complètement transparent

## 🚀 Démarrage Rapide

### Option 1 : Utiliser la version en ligne (recommandé)
Visitez: [https://yourusername.github.io/isaac-analyzer](https://yourusername.github.io/isaac-analyzer)

### Option 2 : Exécuter en local

#### Prérequis
- **Node.js** 16+ et **npm**
- Un fichier de sauvegarde Isaac (fichier `.dat`)

#### Installation
```bash
# Cloner le repository
git clone https://github.com/yourusername/isaac-analyzer.git
cd isaac-analyzer

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000 dans votre navigateur
```

#### Build pour la production
```bash
npm run build
npm run deploy  # Déployer sur GitHub Pages
```

## 📍 Localiser Votre Sauvegarde

Les fichiers de sauvegarde Isaac sont stockés à ces emplacements :

### Windows
```
C:\Users\[VotreNomUtilisateur]\AppData\Roaming\The Binding of Isaac Rebirth\
```
Cherchez le fichier `persistentgamedata`.

### macOS
```
~/Library/Application Support/The Binding of Isaac Rebirth/
```

### Linux
```
~/.local/share/The Binding of Isaac Rebirth/
```

## 📚 Utilisation

1. **Importer votre sauvegarde**
   - Cliquez sur la zone d'upload
   - Sélectionnez votre fichier `.dat`
   - L'analyse commence automatiquement

2. **Explorer vos données**
   - Vue d'ensemble des statistiques globales
   - Progression par DLC
   - Cliquez sur un personnage pour voir les détails

3. **Interpréter les résultats**
   - 🎮 = Nombre de runs
   - 👑 = Victoires
   - 💀 = Morts
   - 📈 = Taux de victoire
   - 🏆 = Déverrouillages

## 🛠️ Architecture Technique

```
isaac-analyzer/
├── src/
│   ├── components/
│   │   ├── App.jsx                 # Composant principal
│   │   ├── FileUploader.jsx        # Upload de fichier
│   │   ├── StatsPanel.jsx          # Statistiques globales
│   │   ├── CharacterGrid.jsx       # Grille de personnages
│   │   └── CharacterCard.jsx       # Carte personnage
│   ├── parsers/
│   │   └── IsaacSavefileParser.js  # Parser .dat
│   ├── styles/
│   │   ├── App.css                 # Styles principaux
│   │   ├── FileUploader.css
│   │   ├── StatsPanel.css
│   │   └── CharacterGrid.css
│   ├── main.jsx                    # Point d'entrée
│   └── App.jsx
├── data/
│   └── characters.json             # Données des personnages
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### Stack Technologique
- **React 18** - Framework UI
- **Vite 4** - Bundler/dev server
- **CSS3** - Stylisation (CSS variables, Flexbox, Grid, animations)
- **Vanilla JS** - Parser savefile

## 🎯 Fonctionnalités Détaillées

### Parser Savefile
Le module `IsaacSavefileParser.js` décode les fichiers `.dat` binaires :

```javascript
const parser = new IsaacSavefileParser();
const data = parser.parseSaveFile(arrayBuffer);
```

**Données extraites :**
- Version du fichier
- État de chaque personnage
- Statistiques de runs (victoires, morts)
- Déverrouillages (boss, modes spéciaux)
- Temps de jeu total

### Logique de Regroupement
Les personnages sont automatiquement groupés par DLC basé sur leur ID :
- 0-9 : Rebirth
- 10-15 : Afterbirth
- 16-18 : Repentance
- 19+ : Repentance+

### Calculs Statistiques
- **Taux de victoire** = (Victoires / Runs totaux) × 100
- **Taux de mort** = (Morts / Runs totaux) × 100
- **Progression personnage** = (Déverrouillages / 6) × 100

## 🐛 Dépannage

### "Fichier invalide"
- ✅ Utilisez le fichier `persistentgamedata` (sans extension)
- ✅ N'utilisez pas de fichiers sauvegarde récents ou corrompus

### "Les données ne se chargent pas"
- Essayez d'actualiser la page
- Videz le cache du navigateur
- Testez avec un autre navigateur

### Le parser retourne 0 partout
- Vérifiez que le fichier n'est pas corrompu
- Assurez-vous d'avoir joué au jeu au moins une fois
- Vérifiez l'intégrité du fichier sauvegarde

## 📈 Feuille de Route

- [ ] Support du parsing des items débloqués
- [ ] Statistiques par run
- [ ] Export des données en JSON/CSV
- [ ] Comparaison avec d'autres joueurs (anonyme)
- [ ] Mode sombre/clair
- [ ] Historique des statistiques
- [ ] Prédictions de déverrouillages
- [ ] Support des sauvegardes en ligne Steam

## 🤝 Contribution

Les contributions sont les bienvenues! 🎉

```bash
# Fork le repository
git clone https://github.com/yourusername/isaac-analyzer.git
git checkout -b feature/nouvelle-fonctionnalite

# Commit vos changements
git commit -am 'Ajoute nouvelle fonctionnalité'
git push origin feature/nouvelle-fonctionnalite

# Créez une Pull Request
```

## 📝 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

### Remerciements
- **Edmund McMillen** pour The Binding of Isaac
- **Nicalis** pour Rebirth et les DLC
- La communauté Isaac pour le support et le feedback

## ⚠️ Avis Légal

Ce projet n'est **pas affilié** à Edmund McMillen, Nicalis ou toute entité officielle de The Binding of Isaac. C'est un outil fan créé indépendamment.

Les fichiers de sauvegarde proviennent de votre installation locale du jeu et restent votre propriété.

## 📞 Support

- 🐛 Signaler un bug : [Issues](https://github.com/yourusername/isaac-analyzer/issues)
- 💬 Questions : [Discussions](https://github.com/yourusername/isaac-analyzer/discussions)
- 📧 Email : your.email@example.com

---

**Fait avec ❤️ pour la communauté Isaac**

![Isaac Logo](https://img.shields.io/badge/The%20Binding%20of%20Isaac-Rebirth-purple?style=for-the-badge)
