# TODO:

```
docker build --platform linux/amd64 -t optiq1 .
docker run optiq1
```

```
library(rsconnect)
deployApp()
```

https://docs.google.com/document/d/1DQ9nP1kYwcYe0VXOb8U0G4uWentZc3X4nWGv4B7Ea6w/edit

- [x] stáhnout data do RDS a načítat z nich (aspoň pro testování)
- [ ] načíst data při otevření aplikace, pak je jen filtrovat (omezení počtu dotazů)


- [x] scrolling na stránce
- [ ] autoři a origin manuscriptu ?
- [x] texty
- [/] detail autorů
    - [x] proklik na díla
- [x] styling
    - [x] linky v detailech modře
    
- [x] manuscript - osekat počty sloupců
- [x] názvy sloupců u datatable
    - [ ] table s autory
    - [ ] řazení sloupců, kde je odkaz - https://stackoverflow.com/questions/77451302/sort-hyperlinks-by-tag-in-shiny-datatable

- [ ] sloučit některé sloupce dohromady
- [ ] neozbrazovat něco v tabulce, pokud chybí data

    
- google analytics - https://docs.posit.co/shiny-server/#admin