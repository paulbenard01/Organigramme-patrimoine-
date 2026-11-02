"""Test navigateur (Playwright).

Installation : pip install playwright && playwright install chromium
Usage       : npm run build && python3 scripts/smoke.py

Vérifie, à 390 px (clair) et 1400 px (sombre) : absence d'erreur JS, absence de
défilement horizontal dans chaque vue, carte mentale (arbre puis vue « liens »),
lien profond vers une fiche, liens des strates, mode parcours, vue Images.
"""
import asyncio
import pathlib
import sys

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist" / "index.html"
VIEWS = ["mindmap", "carte", "musees", "qui", "droit", "parcours", "glossaire", "images"]


async def count(page, sel):
    return await page.evaluate(f"document.querySelectorAll({sel!r}).length")


async def main() -> int:
    problems = []
    url = DIST.as_uri()
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch()
        except Exception:
            browser = await p.chromium.launch(channel="chrome")  # Chrome installé sur la machine
        for name, vp, scheme in [("mobile", {"width": 390, "height": 844}, "light"),
                                 ("bureau", {"width": 1400, "height": 900}, "dark")]:
            mobile = vp["width"] < 1000
            ctx = await browser.new_context(viewport=vp, color_scheme=scheme)
            page = await ctx.new_page()
            page.on("pageerror", lambda e, n=name: problems.append(f"{n}: erreur JS {e}"))
            page.on("console", lambda m, n=name: problems.append(f"{n}: console {m.text}") if m.type == "error" and "Failed to load resource" not in m.text else None)
            await page.goto(url)
            await page.wait_for_timeout(500)

            # Carte mentale : arbre
            if await count(page, "#mmsvg g.mm-band") != 12:
                problems.append(f"{name}: la carte mentale n'affiche pas les 12 strates")
            await page.click("#mmsvg g.mm-band >> nth=1")
            await page.wait_for_timeout(600)
            if await count(page, "#mmsvg g.mm-leaf") == 0:
                problems.append(f"{name}: ouvrir une strate n'affiche pas ses éléments")
            # Vue « liens »
            await page.click("#mmsvg g.mm-leaf >> nth=0")
            await page.wait_for_timeout(700)
            if await count(page, "#mmsvg .mm-focus g.mm-item") == 0 or await count(page, "#mmsvg .mm-focus path.mm-fl") == 0:
                problems.append(f"{name}: la vue « liens » ne dessine pas les voisins")
            if mobile:
                if not await page.evaluate("document.getElementById('panel').hidden"):
                    problems.append(f"{name}: la fiche couvre la vue « liens » sur téléphone")
                await page.click("#mmsvg g.mm-center")
                await page.wait_for_timeout(300)
            if await page.evaluate("document.getElementById('panel').hidden"):
                problems.append(f"{name}: la fiche ne s'ouvre pas depuis la carte mentale")
            # Navigation vers un voisin puis retour à l'arbre
            first = await page.evaluate("document.querySelector('#mmsvg .mm-focus g.mm-item').__data__.id")
            await page.evaluate("document.querySelector('#mmsvg .mm-focus g.mm-item').dispatchEvent(new MouseEvent('click', {bubbles: true}))")
            await page.wait_for_timeout(600)
            if await page.evaluate("document.querySelector('#mmsvg g.mm-center').__data__.id") != first:
                problems.append(f"{name}: toucher un voisin ne recentre pas la vue « liens »")
            if await count(page, "#mm-crumbs button[data-node]") < 1:
                problems.append(f"{name}: le fil d'Ariane ne garde pas l'élément précédent")
            await page.click('#mm-crumbs [data-mm="tree"]')
            await page.wait_for_timeout(500)
            if await page.evaluate("document.getElementById('v-mindmap').dataset.mode") != "tree":
                problems.append(f"{name}: « Vue d'ensemble » ne revient pas à l'arbre")

            # Strates
            await page.click('.tab[data-view="carte"]')
            await page.wait_for_timeout(300)
            await page.click('.chip[data-node="drac"]')
            await page.wait_for_timeout(300)
            if await count(page, "#links path") == 0:
                problems.append(f"{name}: aucun lien tracé pour la DRAC")

            for v in VIEWS:
                await page.click(f'.tab[data-view="{v}"]')
                await page.wait_for_timeout(150)
                over = await page.evaluate("document.documentElement.scrollWidth - innerWidth")
                if over > 0:
                    problems.append(f"{name}: défilement horizontal de {over}px dans la vue {v}")

            # Images
            await page.click('.tab[data-view="images"]')
            await page.wait_for_timeout(200)
            if await count(page, "#gal .gcard") == 0:
                problems.append(f"{name}: la vue Images est vide")
            await page.click("#gal .gcard >> nth=0")
            await page.wait_for_timeout(200)
            if not await page.evaluate("document.getElementById('lb').open"):
                problems.append(f"{name}: la visionneuse d'image ne s'ouvre pas")
            await page.click('#lb [data-lb="close"]')

            # Parcours
            await page.click('.tab[data-view="parcours"]')
            await page.click('[data-act="path-on-map"]')
            await page.wait_for_timeout(400)
            if await count(page, "#links path.ln-path") == 0:
                problems.append(f"{name}: le parcours n'est pas tracé sur la carte")

            # Lien profond
            await page.goto(url + "#mindmap/drac")
            await page.wait_for_timeout(700)
            if await page.evaluate("(document.querySelector('#mmsvg g.mm-center') || {}).__data__?.id") != "drac":
                problems.append(f"{name}: le lien #mindmap/drac n'ouvre pas la DRAC")
            await ctx.close()
        await browser.close()
    for line in problems:
        print("✖", line)
    print("✔ Test navigateur réussi" if not problems else f"{len(problems)} problème(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
