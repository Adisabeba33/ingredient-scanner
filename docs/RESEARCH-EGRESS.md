# What a research campaign needs to reach

The deep-research campaigns cannot run without outbound access to a specific,
small set of hosts. This file is the list, with why each group is on it, so the
environment gets configured once instead of being diagnosed again per brand.

## What happened

The Pedigree batch-1 campaign (PR #15) ran in a session whose egress policy
allowed GitHub and nothing else. Every manufacturer and retailer host answered
`403` at the gateway — a policy denial, not a network fault:

```
curl: (56) CONNECT tunnel failed, response 403     www.pedigree.com
curl: (56) CONNECT tunnel failed, response 403     www.walmart.com
curl: (56) CONNECT tunnel failed, response 403     www.fda.gov
                                            200    github.com
```

The proxy's own log names it: `connect_rejected — gateway answered 403 to
CONNECT (policy denial or upstream failure)`.

Search *results* still arrived — titles and URLs — so the agent could harvest
barcodes out of URL strings. No product *page* could be opened, so no ingredient
list, no guaranteed analysis and no calorie panel could be read. Under
`research/AGENTS.md` §10 that makes `source_verified` unreachable **by
definition**, and the batch landed 14 records with zero of them seedable.

That is not a brand problem. It is the ceiling on every campaign in this
repository, and it will produce the same result on Pro Plan, Sheba or any other
brand until the policy changes.

## The other half of the same problem

The Pro Plan campaign (PR #14) hit the mirror image: that session had web access
but **no shell**, so `scripts/brand-inventory.mjs` and `scripts/check-ledger.mjs`
could not be executed. Its inventory file was hand-reconstructed and its checker
run was simulated — both disclosed honestly in the handoff, and both later run
for real from a shell-enabled session.

**A campaign needs both.** Web egress without a shell cannot validate; a shell
without egress cannot research.

## The hosts

Grouped by the job each does. The evidence priority in `AGENTS.md` §6 is the
reason for the ordering: manufacturer first, retailer second, and a UPC database
never on its own.

### Manufacturer decks — the primary evidence

Nothing below this line can substitute for these. This is where an ingredient
list, a guaranteed analysis and a calorie statement come from.

```
purina.com, www.purina.com, newscenter.purina.com
pedigree.com, cesar.com, sheba.com, iams.com, eukanuba.com,
  nutro.com, whiskas.com, temptationstreats.com, greenies.com
mars.com, marspetcare.com
royalcanin.com, www.royalcanin.com
hillspet.com
bluebuffalo.com
wellnesspetfood.com, instinctpetfood.com, merrickpetcare.com
weruva.com, ziwipets.com
tasteofthewildpetfood.com, diamondpet.com
```

`mars.com` / `marspetcare.com` are not decoration: `data/manufacturers.ts` in the
app repository has **no Mars entry at all**, so the five quality criteria for
every Mars brand have to come from there before any of them can have a page.

### Retailers — identity and the UPC↔size binding

A retailer listing cannot settle a formula, but it is what binds an exact
barcode to an exact printed bag size, which is half of what `source_verified`
means.

```
walmart.com, chewy.com, petsmart.com, petco.com, tractorsupply.com,
target.com, samsclub.com, kroger.com, amazon.com, dollargeneral.com
```

`dollargeneral.com` and `samsclub.com` are on the list because of the 2014
Pedigree recall, which ran through both.

### Regulator — recalls

```
fda.gov, www.fda.gov, accessdata.fda.gov, avma.org
```

`data/recalls.ts` is only ever written from a primary notice. The Pedigree
campaign got as far as FDA's URL slugs and correctly refused to write an entry
from them.

### Archive — the ranges that were renamed

```
web.archive.org, archive.org, wayback.archive-it.org
```

Not optional. Pro Plan's `Savor` and `Focus` and Pedigree's older bag titles
only exist on pages the makers have taken down; the archived copy is the only
way to tell a retired range name from a wrong one. One of the two FDA recall
documents is itself reachable only through `wayback.archive-it.org`.

### GS1 — company prefixes

```
gs1us.org, gepir.gs1.org
```

Low volume, high value: `038100` went into the Pro Plan brief as an unconfirmed
lead precisely because GS1 could not be reached to settle it.

## Where this is configured

The egress policy belongs to the **environment**, not to a session, and it is
chosen when the environment is created or edited — see
https://code.claude.com/docs/en/claude-code-on-the-web for the policies
available. This project currently has one environment, `Default`
(`env_018bDWXTopKZvCejgbN79E42`, Anthropic cloud).

Nothing in this repository can change it, and no agent should try: the proxy
README is explicit that a 403 is reported, never routed around.

## How to check it is fixed

From a session in the environment, before starting a campaign:

```bash
for h in www.pedigree.com www.purina.com www.walmart.com www.fda.gov web.archive.org; do
  printf '%-22s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done
```

Anything that prints `000` with `CONNECT tunnel failed, response 403` is still
blocked. A campaign started against a blocked policy will produce `candidate`
records and a clean checker run, which looks like success and is not — see
PR #15.
