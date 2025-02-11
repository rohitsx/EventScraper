<script lang="ts">
	let userMessage: string = "";
	let isLoading: boolean = false;
	let isChatOpen: boolean = false;
	let chatContainer: HTMLDivElement; // Reference to the chat messages container

	let chatMessages: Array<{
		type: "user" | "bot" | "loading";
		message: string;
	}> = [
		{
			type: "bot",
			message:
				"Want some recommendations or have questions about Sydney events? I can help you!",
		},
	];

	// Reactive statement to scroll to bottom when messages change
	$: if (chatContainer && chatMessages.length) {
		// Use setTimeout to ensure DOM has updated before scrolling
		setTimeout(() => {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}, 0);
	}

	const apiUrl = import.meta.env.VITE_API + "/chat";

	async function sendMessage(event: Event) {
		event.preventDefault(); // Prevent form submission from reloading the page
		if (!userMessage.trim()) return;

		// Store the current message before clearing
		const currentMessage = userMessage;
		// Clear input box immediately
		userMessage = "";

		// Add user message to chat
		chatMessages = [
			...chatMessages,
			{ type: "user", message: currentMessage },
		];

		// Add loading indicator
		chatMessages = [
			...chatMessages,
			{ type: "loading", message: "AI is responding..." },
		];

		isLoading = true;

		try {
			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: currentMessage }),
			});

			if (!response.ok) {
				throw new Error("Failed to fetch bot response");
			}

			const data = await response.json();

			// Remove loading indicator and add bot response
			chatMessages = chatMessages.filter((msg) => msg.type !== "loading");
			chatMessages = [
				...chatMessages,
				{ type: "bot", message: data.botres },
			];
		} catch (error) {
			console.error("Error:", error);

			// Remove loading indicator and add error message
			chatMessages = chatMessages.filter((msg) => msg.type !== "loading");
			chatMessages = [
				...chatMessages,
				{
					type: "bot",
					message: "Sorry, something went wrong. Please try again.",
				},
			];
		} finally {
			isLoading = false;
		}
	}

	function toggleChat() {
		isChatOpen = !isChatOpen;
	}
</script>

<!-- Floating Chatbot Container -->
<div class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
	{#if isChatOpen}
		<!-- Full Chat Window -->
		<div
			class="w-full max-w-md h-[80vh] max-h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col sm:w-96"
		>
			<!-- Header -->
			<header
				class="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center"
			>
				<h1 class="text-lg font-bold">Chatbot</h1>
				<button
					on:click={toggleChat}
					class="text-white hover:text-blue-200"
				>
					Close
				</button>
			</header>

			<!-- Chatbox -->
			<div
				bind:this={chatContainer}
				class="flex-1 p-3 sm:p-4 overflow-y-auto max-h-[70vh]"
			>
				{#each chatMessages as message}
					<div
						class="flex items-start mb-2 {message.type === 'user'
							? 'justify-end'
							: 'justify-start'}"
					>
						{#if message.type !== "user"}
							<div
								class="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 flex-shrink-0"
							>
								{#if message.type === "bot"}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="w-full h-full text-blue-500"
									>
										<path d="M9.375 3a1.875 1.875..." />
									</svg>
								{:else}
									<div
										class="w-full h-full bg-gray-300 rounded-full animate-pulse"
									></div>
								{/if}
							</div>
						{/if}
						<div
							class="max-w-[75%] p-2 sm:p-3 rounded-lg shadow-sm {message.type ===
							'user'
								? 'bg-blue-100 text-blue-800 self-end'
								: message.type === 'loading'
									? 'bg-gray-100 text-gray-600 italic'
									: 'bg-white border border-gray-200 text-gray-700'}"
						>
							<p class="whitespace-pre-wrap">{message.message}</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Input Form -->
			<form
				on:submit={sendMessage}
				class="p-3 sm:p-4 bg-white border-t border-gray-200 shadow-lg rounded-b-lg"
			>
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={userMessage}
						placeholder="Type your message..."
						disabled={isLoading}
						class="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="submit"
						disabled={isLoading}
						class="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Send
					</button>
				</div>
			</form>
		</div>
	{:else}
		<!-- Chatbot Bubble -->
		<button
			on:click={toggleChat}
			class="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 flex items-center justify-center transition-all duration-300 ease-in-out"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 sm:h-8 sm:w-8"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 10h.01M12 10h.01M16 10h.01M..."
				/>
			</svg>
		</button>
	{/if}
</div>
