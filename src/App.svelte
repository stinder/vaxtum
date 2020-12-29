<script>
	//import 'bulma/css/bulma.css';
	import Papa from "papaparse";

	let url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv"
	let data = [];

	// selects one element from each group
	// key_fn identifies group
	// selector_fn used to compare and select one element to take
	let one_from_group = function(array, key_fn, selector_fn) {
		let selected = {};
		array.forEach(element => {
			let key = key_fn(element);
			selected[key] = key in selected ? selector_fn(element, selected[key]) : element;
		});
		return(Object.values(selected));
	}

	let select_countries = function(elem) {
		let interesting_countries = ["United Kingdom", "Germany", "World"]
		return interesting_countries.includes(elem["location"])
	}

	Papa.parse(url, {download:true, header: true, complete: function(results) {
		let parsed = results.data.map(row => {
			console.log(row)
			row.date = new Date(row.date);
			return(row)
		}).filter(row => {
			return(row.location !== '')
		});

		let filtered = parsed.filter(select_countries)

		data = one_from_group(
			filtered,
			//function(e) { return(e.location) },
			element => { return(element.location) },
			(a,b) => { return(a.date > b.date ? a : b) }
		);
	}});
</script>

<section>
	{#each data as { location, total_vaccinations, total_vaccinations_per_hundred, state }, i}
	<div class="thing">
		<h1>
			{location}
		</h1>
		<h2>
			{Number(total_vaccinations).toLocaleString()}	
		</h2>
		<h3>
			{total_vaccinations_per_hundred}%
		</h3>
	</div>
	{/each}
</section>

<style>
	section {
		max-width: 80%;
		margin: auto;
	}
	.thing {
		background-color: rgb(19, 143, 133);
		color: white;
		width: 14em;
		float: left;
		margin: 0.5em;
		padding: 1em;
		border-radius: 4px;
	}

	.thing > * {
		color: white;
		font-family: "Roboto";
	}

	.thing > h1 {
		text-transform: uppercase;
		font-size: 0.8em;
		text-align: left;
	}

	.thing > h2 {
		font-family: "Roboto Slab";
		font-size: 3em;
		font-weight: 900;
		text-align: center;
	}

	.thing > h3 {
		font-family: "Roboto Mono", "Mono";
		font-size: 1em;
		text-align: right;
	}
</style>