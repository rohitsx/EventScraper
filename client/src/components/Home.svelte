<script lang="ts">
	import { onMount } from "svelte";
	import type { Event } from "../lib/types";

	// State variables
	let events: Event[] = [];
	let isLoading = true;
	let error: string | null = null;
	let isModalVisible = false;
	let selectedEventUrl = "";
	let email = "";
	let isSubmittingEmail = false;
	let emailError: string | null = null;

	// Helper function to format dates
	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString("en-AU", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	// Fetch events from the API
	const fetchEvents = async () => {
		try {
			const response = await fetch(import.meta.env.VITE_API);
			if (!response.ok) throw new Error("Failed to fetch events");
			events = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : "An error occurred";
		} finally {
			isLoading = false;
		}
	};

	// Handle "Learn More" button click
	const handleLearnMoreClick = (eventUrl: string) => {
		const hasSubscribed = localStorage.getItem("hasSubscribed");
		if (hasSubscribed) {
			window.open(eventUrl, "_blank");
		} else {
			selectedEventUrl = eventUrl;
			isModalVisible = true;
		}
	};

	// Handle email submission
	const handleEmailSubmission = async () => {
		if (!email) {
			emailError = "Please enter your email";
			return;
		}

		if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			emailError = "Please enter a valid email";
			return;
		}

		isSubmittingEmail = true;
		emailError = null;

		try {
			const response = await fetch(`${import.meta.env.VITE_API}/email`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			if (!response.ok) throw new Error("Failed to submit email");

			localStorage.setItem("hasSubscribed", "true");
			isModalVisible = false;
			window.open(selectedEventUrl, "_blank");
		} catch (err) {
			emailError =
				err instanceof Error ? err.message : "Failed to submit email";
		} finally {
			isSubmittingEmail = false;
		}
	};

	// Fetch events on component mount
	onMount(() => {
		fetchEvents();
	});
</script>

<!-- Main Content -->
<div class="container mx-auto px-32 py-8">
	<h1 class="text-3xl font-bold mb-8 text-gray-800">Sydney Events</h1>

	{#if isLoading}
		<!-- Loading Spinner -->
		<div class="flex justify-center items-center min-h-[200px]">
			<div
				class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
			></div>
		</div>
	{:else if error}
		<!-- Error Message -->
		<div
			class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
		>
			{error}
		</div>
	{:else}
		<!-- Event Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each events as event (event._id)}
				<div
					class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
				>
					<img
						src={event.imageUrl}
						alt={event.title}
						class="w-full h-48 object-cover"
						loading="lazy"
					/>
					<div class="p-4">
						<h2 class="text-xl font-semibold text-gray-800 mb-2">
							{event.title}
						</h2>
						<p class="text-gray-600 text-sm mb-2">
							{event.location}
						</p>
						<div class="text-sm text-gray-500 mb-4">
							<p>From: {formatDate(event.dates.start)}</p>
							<p>To: {formatDate(event.dates.end)}</p>
						</div>
						<button
							on:click={() =>
								handleLearnMoreClick(event.eventUrl)}
							class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-300"
						>
							Learn More
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal -->
{#if isModalVisible}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
	>
		<div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
			<h2 class="text-2xl font-bold mb-4">Subscribe to Continue</h2>
			<p class="text-gray-600 mb-4">
				Please enter your email to access event details. You'll only
				need to do this once.
			</p>
			<div class="mb-4">
				<input
					type="email"
					bind:value={email}
					placeholder="Enter your email"
					class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				{#if emailError}
					<p class="text-red-500 text-sm mt-1">{emailError}</p>
				{/if}
			</div>
			<div class="flex justify-end space-x-3">
				<button
					on:click={() => (isModalVisible = false)}
					class="px-4 py-2 text-gray-600 hover:text-gray-800"
				>
					Cancel
				</button>
				<button
					on:click={handleEmailSubmission}
					disabled={isSubmittingEmail}
					class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isSubmittingEmail}
						Submitting...
					{:else}
						Continue
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
