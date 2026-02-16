# Mon-Mon
## Complete Gameplay Design Document
**Version 2.0 — January 2026**

---

## 1. Core Design Philosophy

Mon-Mon is a VPet-first experience, not a traditional RPG. Raising, care, and training matter more than battling. Emotional attachment is prioritized over optimization. The game is designed for low-attention, long-term play on a handheld device.

### 1.1 Explicitly Excluded Systems

The following systems are intentionally NOT included:

| Excluded System | Reason |
|-----------------|--------|
| XP / Leveling | Stats grow via time-based ticks instead |
| Type advantages | No elemental multipliers or matchup charts |
| Dual types | Simplified identity system |
| Base stat tables | Hidden stats only |
| Personality quizzes | No hidden profiling |
| Permanent death | Retirement system instead |

---

## 2. Creature Identity Model

Each creature is defined by three stacked systems:

| Layer | What It Does | When Set |
|-------|--------------|----------|
| Bias | One stat grows ~20% faster | Fixed per species (hidden) |
| Training | Unlocks move categories | Player controlled |
| Trait | One unique passive ability | Earned at evolution |

Bias is subtle and fixed per species line. Training dominates outcomes. Traits affect behavior rather than raw stats.

### 2.1 Move Names Per Species

Each species has unique move names that map to the same effects:

| Move Type | Elekid | Bulbasaur | Charmander |
|-----------|--------|-----------|------------|
| Basic | Punch | Tackle | Scratch |
| Power | Thunder Punch | Vine Whip | Fire Fang |
| Speed | Quick Shock | Razor Leaf | Flame Dash |
| Endurance | Static Guard | Thick Skin | Heat Shield |

---

## 3. Stat Growth Model

Stats grow gradually over time via growth ticks. Growth distribution is influenced by training focus, care quality, and fatigue. Stat numbers are never shown directly to the player.

| Parameter | Details |
|-----------|---------|
| Visibility | Hidden from player |
| Growth method | Time-based ticks |
| Influences | Training bias, care quality, fatigue |
| Bias effect | ~20% faster growth in one stat per species |

---

## 4. Training System

Three core training types exist: Power, Speed, and Endurance. Training unlocks move types rather than granting direct stat increases. Training increases fatigue and carries risk when overused.

| Training Type | Unlocks | Threshold |
|---------------|---------|-----------|
| Power | Power move (high damage) | 50% training |
| Speed | Speed move (acts first) | 50% training |
| Endurance | Endurance move (damage reduction) | 50% training |

Training while Worn Out or Exhausted has a chance to fail, which counts as a care mistake.

---

## 5. Fatigue System

A hidden fatigue meter with four visible states controls creature performance:

| State | Battle Effect | Training Risk |
|-------|---------------|---------------|
| Rested | Normal performance | None |
| Tired | Act last in turn order tier | Low |
| Worn Out | Act last, 15% miss chance | Medium |
| Exhausted | Act last, 30% miss, reduced damage | High (likely fail) |

Fatigue increases from training, battles, and neglect. Rest and sleep reduce fatigue.

---

## 6. Sleep System

Sleep is an action that recovers fatigue. Creatures are unavailable while sleeping.

| Starting State | Sleep Duration | Recovery |
|----------------|----------------|----------|
| Tired | 30 minutes | Tired → Rested |
| Worn Out | 1 hour | Worn Out → Tired |
| Exhausted | 2 hours | Exhausted → Worn Out |

Recovery is one tier per sleep. An Exhausted creature needs 3 sleep sessions to fully recover.

---

## 7. Care System

Binary care flags instead of meters. Core care needs are Hunger and Cleanliness.

### 7.1 Care Mistake Triggers

| Flag | Grace Period | Stacking |
|------|--------------|----------|
| Hunger | 4 hours | Another mistake every 4 hours |
| Dirty | 6 hours | Another mistake every 6 hours |
| Exhausted | 4 hours | Another mistake every 4 hours |
| Training while Exhausted | Immediate if fails | Per failed attempt |

### 7.2 Care Mistake Thresholds

| Tier | Mistakes Allowed | Result |
|------|------------------|--------|
| Well Cared | 0-1 | Vibrant palette, strong trait |
| Average | 2-3 | Normal palette, normal trait |
| Poor | 4+ | Dull palette, weak trait |

Thresholds are per evolution stage. Mistakes reset between stages.

---

## 8. Battle System

Simple turn-based battles with no type advantages. Outcomes based on stats, unlocked moves, traits, and fatigue.

### 8.1 Turn Order

1. Speed moves go first (among Speed users, higher Speed stat wins)
2. Normal turn order by Speed stat
3. Fatigue penalties apply (Tired+ creatures act last in their tier)

### 8.2 Actions

| Action | Effect |
|--------|--------|
| Attack | Use one of your unlocked moves |
| Swap | Switch to another active creature (uses turn) |

### 8.3 Moves

| Move | Damage | Effect | Unlock |
|------|--------|--------|--------|
| Basic Attack | Low | None | Always available |
| Power | High | None | Power training 50%+ |
| Speed | Medium | Always acts first | Speed training 50%+ |
| Endurance | Low | Reduce incoming damage 50% | Endurance training 50%+ |

### 8.4 Damage Formula

```
Damage = Attacker stat − Defender stat (minimum 1)
```

Power move uses Power stat. Speed move uses Speed stat. Endurance move provides defense boost.

### 8.5 Battle Display

Screen shows attacker first, then switches to defender taking damage. Not split screen — one creature at a time to save screen space on 160×128 display.

### 8.6 Battle End

Battle ends when all 3 active creatures on one side faint. HP persists after battle until rest/care. All participants gain fatigue. Winner gets training boost based on moves used.

---

## 9. Party System

| Slot Type | Count | Status |
|-----------|-------|--------|
| Active | 3 | Need care, can battle, gain training/stats |
| Storage | 3 | Resting, recover fatigue slowly, no care needed |

Swap freely outside battle. Storage creatures cannot battle until swapped to active.

---

## 10. Evolution System

### 10.1 Stage Count

Flexible per species — some have 2 stages, some have 3. No 1-stage creatures except legendaries (TBD).

| Stage Count | Example | Balance |
|-------------|---------|---------|
| 2 stages | Pikachu → Raichu | Longer baby phase + stronger trait |
| 3 stages | Charmander → Charmeleon → Charizard | Normal timing + normal trait |

### 10.2 Evolution Trigger

Time-based with care quality check:

1. Time passes → evolution checkpoint triggers
2. Care quality check → determines tier (Well Cared / Average / Poor)
3. Tier affects palette (vibrant/normal/dull) and trait strength

### 10.3 Care Tier Effects

| Tier | Palette | Trait Strength |
|------|---------|----------------|
| Well Cared | Vibrant, saturated | Full power (e.g., +15%) |
| Average | Normal | Standard (e.g., +10%) |
| Poor | Dull, desaturated | Weak (e.g., +5%) |

Palette is a code-based shift — same sprite, different coloring. No extra art needed.

---

## 11. Lifespan & Retirement

### 11.1 Lifespan

| Phase | Duration | Notes |
|-------|----------|-------|
| Baby | 2-3 days | Growing, needs care |
| Teen (if 3-stage) | 2-3 days | Growing, needs care |
| Adult | 14-21 days | Prime time |
| Elder | Notification → 24hr extension → auto-retire | Ready to rest |

Total time to final form: ~5-7 days. Adults live 14-21 days before Elder prompt.

### 11.2 Elder Phase

When Adult timer ends, creature enters Elder phase:

1. Notification: creature is ready to rest
2. Player can extend ONCE (24 hours)
3. After extension (or if ignored), creature auto-retires next day

Only ONE creature can be in Elder phase at a time. Others wait in Adult until current Elder retires.

### 11.3 Retirement Rewards

| Reward | Details |
|--------|---------|
| Legacy bonus | Small stat boost to egg group (care tier dependent) |
| Unlock progress | Progress toward new egg groups |
| Archive entry | Can revisit retired creatures |

### 11.4 Retirement Balance

| Risk | Solution |
|------|----------|
| Legacy stacking OP | Per egg group + diminishing returns |
| Farming retirements | Poor care = no bonus; min 3-5 day adult time |
| Storage pressure | Keep 6-slot limit; archive for memories |

---

## 12. Sprite System

### 12.1 Source

**PMD Collab Repository** (sprites.pmdcollab.org)

License: CC BY-NC — Credit contributors, non-commercial only.

### 12.2 Pet Screen

| Element | Details |
|---------|---------|
| Sprites | PMD sprites at native size |
| Animations | Idle, Walk, Sleep |
| Behavior | Creature walks around randomly |

### 12.3 Battle Screen

| Element | Details |
|---------|---------|
| Sprites | PMD sprites scaled up |
| Animations | Attack, Hurt |
| Display | Attacker shown → then defender (not split screen) |

### 12.4 Attack Effects (Code-Generated)

| Move | Visual Effect |
|------|---------------|
| Basic | White flash |
| Power | Red particles / impact burst |
| Speed | Blue streak / motion blur |
| Endurance | Green shield / glow |

### 12.5 Portraits

PMD portraits (40×40) for menus and dialogue.

---

## 13. Hardware Reference

| Component | Specification |
|-----------|---------------|
| Device | Mon-Mon Gen 3 |
| Size | 64 × 97 × 22 mm (~71% of DMG) |
| Display | 2.0" ILI9225 TFT, 176×220 pixels |
| MCU | ESP32 Feather HUZZAH32 |
| Battery | 500mAh LiPo |
| Controls | D-pad, A, B (functional); SELECT/START (decorative) |
| Audio | Piezo buzzer PS1240 |

---

## 14. Still To Design

| System | Status |
|--------|--------|
| Catching system | Not designed |
| Trainers / Gyms | Not designed |
| Egg groups & unlocks | Not designed |
| Full traits list | Not designed |
| Specific creature stats/bias/moves | Not designed |
| Menu UI flow | Not designed |
| Legendaries | TBD |

---

*— End of Document —*
