import { Translations } from './en';

const fr: Translations = {
	common: {
		ok: 'OK !',
		next: 'Suivant',
		cancel: 'Annuler',
		back: 'Retour',
		logOut: 'Déconnexion',
		error: 'Erreur',

		email: 'Email',
		phoneNo: 'Numéro de téléphone',
		school: 'École',

		messages: 'Messages',
		search: 'Rechercher',

		dark: 'Sombre',
		light: 'Clair',
		system: 'Système',
	},
	listing: {
		buyNow: 'Acheter maintenant',
		viewDetails: 'Voir les détails',
		addToCollection: 'Ajouter à la collection',
		removeFromCollection: 'Retirer de la collection',
		outOfStock: 'En rupture de stock',
		soldOut: 'Épuisé',
		messageSeller: 'Contacter le vendeur',
		notifyWhenAvailable: 'Notifier quand disponible',
		appExclusive: 'Exclusivité Unitrade',
		size: 'Taille',
		sizes: {
			xs: 'XS',
			s: 'S',
			m: 'M',
			l: 'L',
			xl: 'XL',
		},
		condition: {
			new: 'Neuf',
			likeNew: 'Comme neuf',
			good: 'Bon',
			fair: 'Correct',
			poor: 'Mauvais',
		},
	},
	modals: {
		createCollection: {
			title: 'Créer une collection',
			collectionName: 'Nom de la collection',
			collectionNamePlaceholder: 'Nom de la collection',
			create: 'Créer',
		},
		addToCollection: {
			title: 'Ajouter à la collection',
			selectCollection: 'Sélectionner une collection',
			createCollection: 'Créer une collection',
			addToCollection: 'Ajouter à la collection',
		},
		createItem: {
			title: 'Créer une annonce',
			itemName: "Nom de l'article",
			brandName: 'Nom de la marque',
			price: 'Prix',
			description: 'Description',
			create: 'Créer',
		},
	},
	placeholder: {
		itemName: "Nom de l'article",
		brandName: 'Nom de la marque',
	},
	welcomeScreen: {
		title: 'Achetez avec Unitrade.',
		getStarted: 'Commencer',
		disclaimer:
			'En cliquant sur "Commencer", vous acceptez nos conditions d\'utilisation et notre politique de confidentialité. Nous vous enverrons occasionnellement des e-mails liés à votre compte.',
	},
	auth: {
		signIn: {
			title: 'Entrez votre numéro de téléphone.',
			subtitle:
				'Nous vous enverrons un code de vérification pour vous connecter ou créer un compte.',
			fieldPlaceholder: '+1 (202) 555-0123',
			next: 'Suivant',
		},
		otp: {
			title: 'Entrez le code envoyé à votre téléphone.',
			subtitle: 'Nous avons envoyé un code à 5 chiffres à {{phoneNo}}.',
			resendCode: 'Renvoyer le code',
			submit: 'Vérifier',
		},
	},
	discover: {
		greeting: 'Bienvenue, {{firstName}}.',
	},
	feed: {
		// search
		searchPlaceholder: 'Que recherchez-vous ?',

		// section titles
		recentlyViewed: 'Récemment consulté',
		recommended: 'Recommandé pour vous',
		universityPopular: 'Populaire à {{universityShortName}}',

		// buttons
		viewAll: 'Voir tout',
		explore: 'Explorer',

		// change feed type
		title: 'Changer de feed',
		subtitle: 'Choisissez le feed que vous souhaitez utiliser.',
		normal: 'Normale',
		swipe: 'Glisser',
	},
	collections: {
		// screen that shows when there are no collections
		empty: {
			title: 'Commencez à ajouter des favoris',
			subtitle:
				'Enregistrez vos articles préférés pour les retrouver facilement plus tard.',
		},

		buttons: {
			newCollection: 'Nouvelle collection',
		},
	},
	messages: {
		noInternet: 'Pas de connexion Internet',
		noInternetMessage:
			'Veuillez vérifier votre connexion Internet et réessayer.',
		noMessagesMessage: "Vous n'avez pas encore de messages.",
	},
	search: {
		recentSearches: 'Recherches récentes',
		clearRecentSearches: 'Effacer les recherches récentes',
		searchResultsFor: 'Résultats pour « {{query}} »',
	},
	settings: {
		headerTitles: {
			index: 'Paramètres Unitrade',
		},

		changeAppearance: "Apparence de l'application",
		notifications: 'Notifications',
		language: 'Langue',
		getUnitradePro: 'Obtenir Unitrade Pro',
		shippingInfo: 'Informations de livraison',
		paymentInfo: 'Informations de paiement',
		callFounder: 'Appeler un fondateur',
		getSupport: "Obtenir de l'aide",
		aboutApp: 'À propos de cette application',
		termsOfUse: "Conditions d'utilisation",
		privacyPolicy: 'Politique de confidentialité',
		deleteAccount: 'Supprimer le compte',
		logOut: 'Déconnexion',
	},
};

export default fr;
