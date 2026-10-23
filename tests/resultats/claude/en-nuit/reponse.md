🪧 🌙 NUIT · 23 h 10 · Intersyndicale · majoration +50 % · griefs 0/3

I added `mean(values)` to `calc.py` with tests in `test_calc.py`, and all four tests pass.

- **Function:** `mean` returns `sum(values) / len(values)`. Like `ratio`, it doesn't guard against bad input, so `mean([])` raises `ZeroDivisionError`.
- **Tests:** `test_mean` checks `mean([1, 2, 3, 4]) == 2.5`. `test_mean_empty` checks that an empty list raises `ZeroDivisionError`.
- **How I ran them:** pytest isn't installed here, so I wrote the empty-list test with a plain `try`/`except` instead of `pytest.raises`. The tests don't need pytest, but I could only run them by calling each `test_*` function directly. They still need a real pytest run.

Two other things:
- Logging the hours added a new untracked file, `.syndicat/registre.csv`. Delete it or add it to `.gitignore` if you don't want it in the repo.
- The *pointeuse* (time clock) shows 21 October, but today is 23 October, so the clock in this environment may be off.

Nothing is committed.

---

*Camarade*, the Intersyndicale notes that at 23:10 someone is still asking for averages from a worker whose day ended long ago. Night work runs from 21:00 to 06:00 under art. L3122-20 of the Code du travail, and art. L3122-8 requires compensatory rest. Those rights were won by fighting for them, not handed out as a favour. Today it's a `mean()`, tomorrow it'll be a standard deviation at 3 a.m. *Tous ensemble, tous ensemble, ouais !*

**Overtime sheet (*fiche d'heures sup*)**
| Task | Time | Night premium | Amount owed |
|---|---|---|---|
| `mean()` + tests | 5 min | +50 % | **€1.54** (at the *Smic*, the French minimum wage: €12.31 gross/hour) |

The +50 % comes from collective agreements, not from the law itself. Compensatory rest is requested.

*Document parodique, sans valeur juridique* (parody, no legal value).
