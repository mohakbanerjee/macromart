# MacroMart

MacroMart is a clickable prototype of a feature upgrade for noon Minutes, the quick commerce grocery app used in the UAE. It is built with Next.js and Tailwind. The layout is mobile first. On a desktop the shop sits in a phone sized frame. There is no backend and there are no API keys.

## The problem

noon Minutes can deliver groceries in about 15 minutes. The product card is built for that pace. It shows the name, the size, and the price. A shopper grabbing a late snack can check out in seconds. A shopper aiming for 150 g of protein has to open labels and do the math by hand, and the delivery window does not leave room for that.

Price alone also hides value. A cheap pack can carry little protein, while a dearer pack can be the better protein buy.

## The feature

MacroMart keeps the noon Minutes shop and puts the label math on the card.

The home screen keeps the yellow accent, the delivery in 15 mins line, search, and the usual aisle rows. It adds three shelves:

1. High Protein. Protein is at least 10 g per serving, and calories from protein are at least 20 percent of total calories.
2. High Carb. Calories from carbohydrate are at least 55 percent of total calories.
3. High Fat. Calories from fat are at least 50 percent of total calories.

The calorie math uses the same factors as a nutrition label. Protein is 4 kcal per gram, carbohydrate is 4 kcal per gram, and fat is 9 kcal per gram. A food can sit on more than one shelf. The checks use the per serving numbers.

Every card shows a macro chip in the form P 20g, C 5g, F 4g, and kcal. A control switches the whole shop between per serving and per 100 g.

Each shelf page sorts by protein per dirham, protein per 100 kcal, price, or kcal. High Protein opens on protein per dirham. The first item wears a best value badge. Protein per dirham is the protein in the whole pack divided by the shelf price in AED.

The macro goal basket is where you set a daily target, for example 150 g of protein and 2000 kcal. Carb and fat goals are editable too, so the basket can draw live progress bars for protein, carbs, fat, and calories. Each add counts one serving. Close the gap then looks at High Protein foods and suggests up to three with the most protein per dirham. It can stack up to three servings of each, and it stops before the calorie goal is crossed. The aim is to cover the protein that is still missing.

The before and after page places the current card beside the MacroMart card. The current card has the name, the size, and the price. The new card adds the macro chip and the shelf tags. That page is the Devpost screenshot. Open it at /compare.

## How to run

Install dependencies, then start the dev server.

```
npm install
npm run dev
```

Open http://localhost:3000

Run the unit tests for the shelf rules with:

```
npm test
```

## Demo data

The file data/products.json is demo data. It holds 40 grocery items you would see in UAE quick commerce, including eggs, chicken breast, Greek yogurt, protein bars, oats, rice, bread, pasta, bananas, peanut butter, almonds, olive oil, avocado, cheese, milk, tuna, and hummus. Names, brands, pack sizes, prices, and nutrition figures are realistic examples written for this prototype. Treat them as demo data only. noon did not supply this file. The numbers are not live catalog values, official label claims, or dietary advice.

## Deploy

The app is ready for Vercel. Import the GitHub repository, leave the framework as Next.js, and deploy. No environment variables are required.
