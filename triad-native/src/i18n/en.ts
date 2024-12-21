const en = {
	common: {
		ok: 'OK',
		next: 'Next',
		cancel: 'Cancel',
		back: 'Back',
		logOut: 'Log Out',
		error: 'Error',

		email: 'Email',
		phoneNo: 'Phone Number',
		school: 'University',

		messages: 'Messages',
		search: 'Search',

		dark: 'Dark',
		light: 'Light',
		system: 'System',

		// Add these new translations
		showLess: 'Show Less',
		readMore: 'Read More',
	},
	listing: {
		message: 'Message Seller',
		makeOffer: 'Make Offer',
		buyNow: 'Buy Now',
		viewDetails: 'View Details',
		addToCollection: 'Add to Collection',
		removeFromCollection: 'Remove from Collection',
		outOfStock: 'Out of Stock',
		soldOut: 'Sold Out',
		messageSeller: 'Message Seller',
		notifyWhenAvailable: 'Notify When Available',
		appExclusive: 'Unitrade Exclusive',
		size: 'Size',
		sizes: {
			xs: 'XS',
			s: 'S',
			m: 'M',
			l: 'L',
			xl: 'XL',
		},
		condition: {
			new: 'New',
			likeNew: 'Like New',
			good: 'Good',
			fair: 'Fair',
			poor: 'Poor',
		},

		// Add these new translations
		reviews: 'Reviews',
		ratings: 'Ratings',
		seller: 'Seller',
		selectColor: 'Select Color',
		selectSize: 'Select Size',
	},
	modals: {
		aboutUniversity: {
			title: 'About Your University',
			body0: 'Your account is currently associated with:',
			body1: "If you've transferred to another university, you can change your email to your new university's email.",
		},
		createCollection: {
			title: 'Create Collection',
			collectionName: 'Collection Name',
			collectionNamePlaceholder: 'Collection Name',
			create: 'Create',
		},
		addToCollection: {
			title: 'Add to Collection',
			selectCollection: 'Select Collection',
			createCollection: 'Create Collection',
			addToCollection: 'Add to Collection',
		},
		createItem: {
			title: 'Create Listing',
			itemName: 'Item Name',
			brandName: 'Brand Name',
			price: 'Price',
			description: 'Description',
			create: 'Create',
		},
	},
	placeholder: {
		itemName: 'Item Name',
		brandName: 'Brand Name',
	},
	welcomeScreen: {
		title: 'Shop with Unitrade.',
		subtitle: 'The best way to discover and sell things on campus.',
		getStarted: 'Get Started',
		disclaimer:
			'By pressing "Get Started," you agree to our Terms of Service and Privacy Policy.',
	},
	auth: {
		signIn: {
			title: 'Enter your school email.',
			subtitle:
				"We'll send you a verification code to log in or create an account.",
			fieldPlaceholder: 'you@school.edu',
			next: 'Proceed',
		},
		signup: {
			startTitle: 'Welcome to Unitrade.',
			startSubtitle: 'Create an account to get started.',

			nameTitle: "What's your name?",
			nameSubtitle: 'This is how others will see you.',
			namePlaceholder: 'Eve Holloway',

			usernameTitle: 'Choose a username.',
			usernameSubtitle: 'This cannot be changed later.',
			usernamePlaceholder: 'eve.holloway',
		},
		signOut: {
			title: 'Log out',
			subtitle: 'Are you sure you want to log out?',
			cancel: 'Cancel',
			logOut: 'Log Out',
		},
		otp: {
			title: 'Enter the code sent to your email.',
			subtitle: 'We sent a 6-digit code to {{email}}.',
			resendCode: 'Resend Code',
			submit: 'Verify',
		},
	},
	discover: {
		greeting: 'Welcome back, {{firstName}}.',
	},
	feed: {
		// search
		searchPlaceholder: 'What are you looking for?',

		// section titles
		recentlyViewed: 'Recently Viewed',
		recommended: 'For You',
		universityPopular: 'Popular at {{universityShortName}}',

		// buttons
		viewAll: 'View All',
		explore: 'Explore',

		// change feed type
		title: 'Switch Feed',
		subtitle: 'Pick which feed you would like to use.',
		normal: 'Normal',
		swipe: 'Swipe',
	},
	collections: {
		// screen that shows when there are no collections
		empty: {
			title: 'Start adding favorites',
			subtitle: 'Save your favorite items to easily find them later.',
		},

		buttons: {
			newCollection: 'New Collection',
		},
	},
	messages: {
		noInternet: 'No internet connection',
		noInternetMessage:
			'Please check your internet connection and try again.',
		noMessagesMessage: 'You have no messages yet.',
	},
	search: {
		recentSearches: 'Recent Searches',
		clearRecentSearches: 'Clear Recent Searches',
		searchResultsFor: 'Results for “{{query}}”',
	},
	settings: {
		headerTitles: {
			index: 'Unitrade Settings',
		},
		pages: {
			deleteAccount: {
				title: 'Are you sure you want to delete your account?',
				subtitle: 'If you delete your account:',
				text0: 'You will lose all data, including your profile, listings, reviews, and saved items.',
				text1: 'Once you delete your account, you will be logged out of this app.',
				text2: 'To access your order information after you delete your account, contact customer support at:',
				text3: 'support@unitrade.so',
				text4: 'If you change your mind, you can always come back and open a new account with us.',
				checkboxText:
					'I understand that this action cannot be undone, and I want to delete my account.',
				buttonDelete: 'Delete Account',
				buttonCancel: 'Cancel',
			},
		},
		changeAppearance: 'App Appearance',
		notifications: 'Notifications',
		language: 'Language',
		getUnitradePro: 'Get Unitrade Pro',
		shippingInfo: 'Shipping/Dorm Information',
		paymentInfo: 'Payment Information',
		callFounder: 'Call a Founder',
		getSupport: 'Get Support',
		aboutApp: 'About this App',
		acknowledgements: 'Acknowledgements',
		termsOfUse: 'Terms of Use',
		privacyPolicy: 'Privacy Policy',
		blockedUsers: 'Blocked Users',
		deleteAccount: 'Delete Account',
		logOut: 'Log Out',
	},
};

export default en;
export type Translations = typeof en;
