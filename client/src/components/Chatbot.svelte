<script lang="ts">
	let userMessage: string = "";
	let isLoading: boolean = false;
	let isChatOpen: boolean = false;
	let chatContainer: HTMLDivElement;

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

	$: if (chatContainer && chatMessages.length) {
		setTimeout(() => {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}, 0);
	}

	const apiUrl = import.meta.env.VITE_API + "/chat";

	async function sendMessage(event: Event) {
		event.preventDefault();
		if (!userMessage.trim()) return;

		const currentMessage = userMessage;
		userMessage = "";

		chatMessages = [
			...chatMessages,
			{ type: "user", message: currentMessage },
		];

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

			chatMessages = chatMessages.filter((msg) => msg.type !== "loading");
			chatMessages = [
				...chatMessages,
				{ type: "bot", message: data.botres },
			];
		} catch (error) {
			console.error("Error:", error);

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

<!-- Floating Chatbot Container with improved responsive design -->
<div
	class="fixed bottom-0 right-0 md:bottom-4 md:right-4 lg:bottom-6 lg:right-6 z-50 w-full md:w-auto"
>
	{#if isChatOpen}
		<!-- Full Chat Window -->
		<div
			class="w-full md:w-[400px] lg:w-[450px] h-[100vh] md:h-[80vh] md:max-h-[600px] bg-white shadow-xl border border-gray-200 flex flex-col relative"
		>
			<!-- Header -->
			<header
				class="bg-blue-600 text-white p-3 md:p-4 flex justify-between items-center sticky top-0 z-10"
			>
				<h1 class="text-base md:text-lg font-bold">Chatbot</h1>
				<button
					on:click={toggleChat}
					class="text-white hover:text-blue-200 p-2 rounded-full hover:bg-blue-700 transition-colors"
					aria-label="Close chat"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</header>

			<!-- Chatbox with improved spacing -->
			<div
				bind:this={chatContainer}
				class="flex-1 p-2 md:p-4 overflow-y-auto"
			>
				{#each chatMessages as message}
					<div
						class="flex items-start mb-3 {message.type === 'user'
							? 'justify-end'
							: 'justify-start'} animate-fade-in"
					>
						{#if message.type !== "user"}
							<div
								class="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mr-2 flex-shrink-0"
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
							class="max-w-[85%] md:max-w-[75%] p-2 md:p-3 rounded-lg shadow-sm {message.type ===
							'user'
								? 'bg-blue-100 text-blue-800 self-end'
								: message.type === 'loading'
									? 'bg-gray-100 text-gray-600 italic'
									: 'bg-white border border-gray-200 text-gray-700'}"
						>
							<p class="whitespace-pre-wrap text-sm md:text-base">
								{message.message}
							</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Input Form with improved mobile handling -->
			<form
				on:submit={sendMessage}
				class="p-2 md:p-4 bg-white border-t border-gray-200 sticky bottom-0"
			>
				<div class="flex gap-2 items-center">
					<input
						type="text"
						bind:value={userMessage}
						placeholder="Type your message..."
						disabled={isLoading}
						class="flex-1 p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="submit"
						disabled={isLoading}
						class="px-3 md:px-4 lg:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<span class="hidden md:inline">Send</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 md:hidden"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
							/>
						</svg>
					</button>
				</div>
			</form>
		</div>
	{:else}
		<!-- Chatbot Bubble with improved touch target -->
		<button
			on:click={toggleChat}
			class="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 flex items-center justify-center transition-all duration-300 ease-in-out m-4 md:m-0"
			aria-label="Open chat"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8"
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

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fadeIn 0.3s ease-out;
	}
</style>
