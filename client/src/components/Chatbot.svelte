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
<div class="fixed bottom-6 right-6 z-50">
	{#if isChatOpen}
		<!-- Full Chat Window -->
		<div
			class="w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col"
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
				class="flex-1 p-4 overflow-y-auto"
			>
				{#each chatMessages as message}
					<div
						class="flex items-start mb-4 {message.type === 'user'
							? 'justify-end'
							: 'justify-start'}"
					>
						{#if message.type !== "user"}
							<div class="w-10 h-10 mr-3 flex-shrink-0">
								{#if message.type === "bot"}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="w-10 h-10 text-blue-500"
									>
										<path
											d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.75A1.875 1.875 0 0 0 9 5.625v-1.5H6.75A1.875 1.875 0 0 1 4.875 1.5h-1.5a1.875 1.875 0 0 0-1.875 1.875v1.5c0 1.036.84 1.875 1.875 1.875h1.5V12h-3.75A1.875 1.875 0 0 0 0 13.875v.75c0 1.036.84 1.875 1.875 1.875h7.5c1.035 0 1.875-.84 1.875-1.875v-4.5h1.875a1.875 1.875 0 0 0 0-3.75h-1.875v-1.5c0-1.036-.84-1.875-1.875-1.875h-1.5Zm0 1.875h1.5v1.5h-1.5v-1.5Zm0 7.5h1.5v4.5h-1.5v-4.5Zm-3-6h1.5v1.5h-1.5v-1.5Z"
										/>
										<path
											d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 1.036.84 1.875 1.875 1.875H18a2.25 2.25 0 0 1 2.25 2.25v3.75a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-3.75a2.25 2.25 0 0 1 2.25-2.25h1.5v-1.875A5.23 5.23 0 0 1 9.28 1.84a.75.75 0 0 1 .694 1.316 3.73 3.73 0 0 0-1.745 3.124v1.875h6.75v-1.875a3.73 3.73 0 0 0-1.745-3.124.75.75 0 1 1 .694-1.316Z"
										/>
									</svg>
								{:else}
									<div
										class="w-10 h-10 bg-gray-300 rounded-full animate-pulse"
									></div>
								{/if}
							</div>
						{/if}
						<div
							class="max-w-[70%] p-3 rounded-lg shadow-sm {message.type ===
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
				class="p-4 bg-white border-t border-gray-200 shadow-lg rounded-b-lg"
			>
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={userMessage}
						placeholder="Type your message..."
						disabled={isLoading}
						class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="submit"
						disabled={isLoading}
						class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
			class="w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 flex items-center justify-center transition-all duration-300 ease-in-out"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-8 w-8"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
				/>
			</svg>
		</button>
	{/if}
</div>
