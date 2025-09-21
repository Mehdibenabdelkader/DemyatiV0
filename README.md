# Demyati 🎲

**Demyati** is a fun and competitive board game inspired by the classic **Snakes and Ladders**, but with a unique twist.  
Instead of snakes and ladders, players face a strategic journey across a **200-tile board**, using dice rolls and powerful cards to race toward the finish line.

---

## 🎯 Objective
Be the first player to reach **tile 200** on the board.

---

## 👥 Players
- Supports **2 to 4 players** per game room.  
- Each player begins on **tile 0**.

---

## 📝 Rules
1. On their turn, a player rolls a **six-sided dice** and moves forward the corresponding number of tiles.
2. If the player lands on a **prime number tile**, they get to **draw and play a card**.
3. The effects of the card are applied immediately.
4. If multiple players land on the same tile, they **co-exist** — no elimination by collision.
5. The game continues in turns until one player reaches **tile 200** exactly.  
   - If a dice roll would move a player beyond 200, their piece does **not move** that turn.

---

## 🃏 Cards
When landing on a prime number, the player must draw a card. Each card comes with a special effect that changes the flow of the game.  

### Card Types
- **Boost Cards**
  - *Leap Forward*: Move ahead by +5 tiles.
  - *Double Roll*: Roll the dice again immediately.
  - *Shortcut*: Move directly to the next multiple of 10.

- **Trap Cards**
  - *Step Back*: Move backward by -3 tiles.
  - *Skip Turn*: Miss your next turn.
  - *Slippery Path*: Move back to the nearest prime number behind you.

- **Tactical Cards**
  - *Swap*: Swap positions with another player.
  - *Block*: Prevent one chosen player from moving on their next turn.
  - *Prime Magnet*: Pull another player back to the **last prime number** they passed.

---

## 🏆 Winning
The first player to land exactly on **tile 200** wins the game and claims the title of **Demyati Champion**.

---

## 🌟 Highlights
- Dice-based movement keeps the game simple and familiar.  
- Prime number mechanic adds strategy and unpredictability.  
- Special cards encourage tactical decisions and player interaction.  
- Each playthrough offers new twists and excitement!

---

## Commit types

- feat:
A new feature for the game/app.

feat: implement prime number detection on board

- fix:
A bug fix.

fix: prevent player from moving past tile 200

- chore:
Maintenance tasks that don’t affect game logic or user-facing behavior (e.g., configs, dependencies, CI).

chore: update .gitignore file
chore(deps): bump socket.io to latest

- docs:
Documentation changes only.

docs: add README with game rules

- style:
Code style/formatting (no logic changes).

style: format board rendering function

- refactor:
Refactoring code without changing functionality.

refactor: simplify dice roll function