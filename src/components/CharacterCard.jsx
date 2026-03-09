import React, { useState, useEffect } from 'react';
import SpriteManager from '../utils/SpriteManager.js';

const CharacterCard = ({ characterId, characterMenu, characterMenuAlt, saveData }) => {
  const [spriteUrl, setSpriteUrl] = useState(null);
  const [completionMarks, setCompletionMarks] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!characterMenu) return;

    // Générer l'URL du sprite
    const url = SpriteManager.getCharacterSpriteDataUrl(characterId, characterMenu);
    setSpriteUrl(url);

    // Vérifier si le personnage est débloqué
    const unlockedCount = saveData?.chunks?.[2]?.data?.counters?.[characterId] || 0;
    setIsUnlocked(unlockedCount > 0);

    // Générer les completion marks pour ce personnage
    const marks = generateCompletionMarks(characterId, saveData);
    setCompletionMarks(marks);
  }, [characterId, characterMenu, saveData]);

  const generateCompletionMarks = (charId, data) => {
    // Logique pour déterminer les completion marks basés sur les achievements
    const achievements = data?.chunks?.[1]?.data?.achievements || [];
    const marks = [];
    return marks;
  };

  const characterName = SpriteManager.getCharacterName(characterId);

  return (
    <div className={`character-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
      {spriteUrl && (
        <img
          src={spriteUrl}
          alt={characterName}
          className="character-sprite"
          draggable="false"
        />
      )}
      <div className="character-name">{characterName}</div>
      {completionMarks.length > 0 && (
        <div className="completion-marks">
          {completionMarks.map((mark, idx) => (
            <div key={idx} className={`completion-mark ${mark.color}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
