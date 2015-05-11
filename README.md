# emotion-tracker

Chrome extension for tracking emotions from the webcam. Uses [clmtrackr][1] to detect facial expressions, and records what tab you are at when emotions peak. Currently also stores second-by-second emotional data, but can't display much due to performance.

Saves bookmarks to "Other Bookmarks/Emotion Bookmarks" (this is a bit buggy still); 

Adds a color-coded icon to let you know which emotion it's picking up, click on it to see more details. (the extension should automatically redirect you to the options page to allow the camera. If not, go to chrome://extensions/ and click on "options")

From the popup, or the options page, you can click "data" to see a graph of the last 60 seconds. The data page also has a listing of events over the last hour, with links to whatever url was active.

### Issues and to-dos

- [ ] The model needs more training, it regularly thinks my mustache is my upper lip, and my eyebrows are my eyes.
- [ ] Find a better data storage solution, or only store "events." indexedDB is cool, but too slow when trying to get 3600 records an hour.
- [ ] Do something with events, there are lots of options here:
  - [ ] bookmark sites that make you smile
  - [ ] pop an alert for different states, maybe you haven't smiled in a while, or maybe your anger is higher than average on this tab.
  - [ ] Auto-add emotion content to Facebook posts?
- [ ] Lots of options for analytics, but need a better data solution first. What sites make you sad? What times of day are you happy? What emotions make you visit Facebook?
- [ ] Add recognition for more expressions.
  - [ ] Blink/eyes closed
  - [ ] Wink (might be interesting for triggering commands?)
  - [ ] Yawn/Sleepy
  - [ ] Hand obscuring face? (might be useful if you're trying to stop biting nails...)
  - [ ] Chewing (know what sites make you hungry?)
  - [ ] Looking away from screen/ being AFK.







[1]: https://github.com/auduno/clmtrackr
