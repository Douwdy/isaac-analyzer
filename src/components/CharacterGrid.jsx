import React from 'react';
import CharacterCard from './CharacterCard';
import '../styles/CharacterGrid.css';

function CharacterGrid({ characters, parser }) {
  // Filtrer les personnages qui ne sont pas vides
  const validCharacters = characters.filter((char, idx) => 
    char.completed || char.runs > 0 || char.victories > 0 || char.deaths > 0
  );

  // Grouper par DLC
  const groupedByDLC = {
    'Rebirth': [],
    'Afterbirth': [],
    'Repentance': [],
    'Repentance+': []
  };

  validCharacters.forEach((char, idx) => {
    const dlc = parser.getDLCForCharacter(idx);
    groupedByDLC[dlc].push({ ...char, id: idx });
  });

  return (
    <div className="character-grid-wrapper">
      {Object.entries(groupedByDLC).map(([dlc, chars]) => 
        chars.length > 0 && (
          <section key={dlc} className={`dlc-section dlc-${dlc.toLowerCase().replace('+', 'plus')}`}>
            <h4 className="dlc-header">🔓 {dlc}</h4>
            <div className="character-grid">
              {chars.map((char) => (
                <CharacterCard 
                  key={char.id} 
                  character={char}
                  characterId={char.id}
                  parser={parser}
                />
              ))}
            </div>
          </section>
        )
      )}

      {validCharacters.length === 0 && (
        <div className="no-data">
          <p>Aucune donnée de personnage trouvée</p>
        </div>
      )}
    </div>
  );
}

export default CharacterGrid;
