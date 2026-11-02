"""Test navigateur optionnel.

Installation : pip install playwright && playwright install chromium
Usage       : python3 scripts/smoke.py   (après npm run build)

Vérifie, à 390 px et 1400 px : absence d'erreur JS, absence de défilement
horizontal dans chaque vue, tracé des liens et du mode parcours.
"""
import asyncio
import pathlib
import sys

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist" / "index.html"
VIEWS = ["mindmap", "carte", "musees", "qui", "droit", "parcours", "glossaire"]


async def main() -> int:
    html = DIST.read_text(encoding="utf8")
    wrapped = ROOT / "dist" / "_smoke.html"
    wrapped.write_text(
        '<!doctype html><html><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        "<style>[hidden]{display:none!important}body{margin:0}</style></head><body>"
        + html + "</body></html>",
        encoding="utf8",
    )
    problems = []
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch()
        except Exception:
            browser = await p.chromium.launch(channel="chrome")  # Chrome installé sur la machine
        for name, vp, scheme in [("mobile", {"width": 390, "height": 844}, "light"),
                                 ("bureau", {"width": 1400, "height": 900}, "dark")]:
            ctx = await browser.new_context(viewport=vp, color_scheme=scheme)
            page = await ctx.new_page()
            page.on("pageerror", lambda e, n=name: problems.append(f"{n}: erreur JS {e}"))
            await page.goto(wrapped.as_uri())
            await page.wait_for_timeout(400)
            # carte mentale (vue d'ouverture)
            if await page.evaluate("document.querySelectorAll('#mmsvg g.mm-node').length") < 13:
                problems.append(f"{name}: la carte mentale n'affiche pas ses branches")
            await page.click('#mmsvg g.mm-band >> nth=1')
            await page.wait_for_timeout(500)
            await page.click('#mmsvg g.mm-leaf >> nth=0')
            await page.wait_for_timeout(700)
            if await page.evaluate("document.querySelectorAll('#mmsvg .mm-x path').length") == 0:
                problems.append(f"{name}: aucun lien dessiné sur la carte mentale")
            if await page.evaluate("document.getElementById('panel').hidden"):
                problems.append(f"{name}: la fiche ne s'ouvre pas depuis la carte mentale")
            await page.click('.tab[data-view="carte"]')
            await page.wait_for_timeout(300)
            await page.click('.chip[data-node="drac"]')
            await page.wait_for_timeout(300)
            if await page.evaluate("document.querySelectorAll('#links path').length") == 0:
                problems.append(f"{name}: aucun lien tracé pour la DRAC")
            for v in VIEWS:
                await page.click(f'.tab[data-view="{v}"]')
                await page.wait_for_timeout(150)
                over = await page.evaluate("document.documentElement.scrollWidth - innerWidth")
                if over > 0:
                    problems.append(f"{name}: défilement horizontal de {over}px dans la vue {v}")
            await page.click('.tab[data-view="parcours"]')
            await page.click('[data-act="path-on-map"]')
            await page.wait_for_timeout(400)
            if await page.evaluate("document.querySelectorAll('#links path.ln-path').length") == 0:
                problems.append(f"{name}: le parcours n'est pas tracé sur la carte")
            await ctx.close()
        await browser.close()
    wrapped.unlink(missing_ok=True)
    for line in problems:
        print("✖", line)
    print("✔ Test navigateur réussi" if not problems else f"{len(problems)} problème(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
