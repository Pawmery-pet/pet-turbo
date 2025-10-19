export const landingData = {
	// Hero Section
	hero: {
		title: "Everybody Needs A Friend In Life",
		subtitle:
			"Keep your beloved pets close to your heart forever. Continue their beautiful story and cherish your ongoing bond.",
		cta: "Begin Your Journey",
		petImages: [
			{
				src: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop&crop=face",
				alt: "Happy Shiba Inu",
			},
			{
				src: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face",
				alt: "Fluffy White Dog",
			},
			{
				src: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&crop=face",
				alt: "Golden Retriever Puppy",
			},
		],
	},

	// Features Section
	features: [
		{
			icon: "💝",
			title: "Preserve Their Story",
			description:
				"Keep your pet's unique personality and precious memories alive through their ongoing story",
		},
		{
			icon: "💬",
			title: "Continue the Bond",
			description:
				"Share moments and continue your beautiful relationship whenever your heart needs comfort",
		},
		{
			icon: "🌟",
			title: "Find Peace",
			description:
				"A gentle space to honor your pet's memory and find solace in your everlasting connection",
		},
	],

	// Pet Types Section
	petTypes: [
		{
			name: "Dogs",
			image:
				"https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=face",
			alt: "Dog",
		},
		{
			name: "Cats",
			image:
				"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop&crop=face",
			alt: "Cat",
		},
		{
			name: "Birds",
			image:
				"https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=300&h=300&fit=crop&crop=face",
			alt: "Bird",
		},
		{
			name: "Other Pets",
			image:
				"https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=300&h=300&fit=crop&crop=face",
			alt: "Rabbit",
		},
	],

	// Video Section
	video: {
		title: "See How Pawmery Works",
		subtitle:
			"Watch how we help preserve your pet's story and keep their memory alive",
		thumbnail:
			"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=450&fit=crop",
		stats: "★★★★★ 4.9/5 from 1,200+ families",
	},

	// Services Section
	services: [
		{
			title: "Story Creation",
			description:
				"Start preserving your pet's precious memories with our guided story creation process",
			image:
				"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=300&fit=crop",
			cta: "Learn More",
			href: "/pets/create-story",
		},
		{
			title: "Personality Analysis",
			description:
				"Discover and preserve your pet's unique personality through our detailed analysis",
			image:
				"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=300&fit=crop",
			cta: "Learn More",
			href: "/pets/create-story",
		},
		{
			title: "Memory Dashboard",
			description:
				"Keep all your pet's stories and memories organized in one beautiful space",
			image:
				"https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=300&fit=crop",
			cta: "Learn More",
			href: "/dashboard",
		},
	],

	// Subscription Tiers
	subscriptionTiers: [
		{
			name: "Free",
			price: "$0",
			period: "/month",
			description: "Get Started",
			features: [
				"Create 1 pet story",
				"Basic personality analysis",
				"Photo storage (10 photos)",
				"Community support",
			],
			cta: "Start Free",
			popular: false,
		},
		{
			name: "Premium",
			price: "$9.99",
			period: "/month",
			description: "Most Popular",
			features: [
				"Unlimited pet stories",
				"Advanced personality analysis",
				"Unlimited photo storage",
				"Priority support",
				"Custom story themes",
			],
			cta: "Choose Premium",
			popular: true,
		},
		{
			name: "Family",
			price: "$19.99",
			period: "/month",
			description: "Best Value",
			features: [
				"Everything in Premium",
				"Family sharing (up to 5 members)",
				"Advanced memory features",
				"Custom story themes",
				"Dedicated support",
			],
			cta: "Choose Family",
			popular: false,
		},
	],

	// Newsletter Section
	newsletter: {
		title: "Stay Connected",
		subtitle: "Get tips on preserving pet memories and updates on new features",
		image:
			"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop",
		cta: "Subscribe",
	},

	// Blog Section
	blog: [
		{
			title: "5 Ways to Preserve Your Pet's Memory",
			excerpt:
				"Discover meaningful ways to keep your beloved pet's spirit alive in your heart and home.",
			image:
				"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=250&fit=crop",
			author: "Sarah Johnson",
			date: "Dec 15, 2024",
			href: "#",
		},
		{
			title: "Creating the Perfect Pet Story",
			excerpt:
				"Learn how to capture your pet's unique personality and create lasting memories.",
			image:
				"https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=250&fit=crop",
			author: "Mike Chen",
			date: "Dec 12, 2024",
			href: "#",
		},
		{
			title: "Dealing with Pet Loss: Finding Comfort",
			excerpt:
				"Gentle guidance on processing grief and finding peace after losing a beloved companion.",
			image:
				"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=250&fit=crop",
			author: "Dr. Emily Watson",
			date: "Dec 10, 2024",
			href: "#",
		},
	],

	// Footer
	footer: {
		description: "Keep your beloved pets close to your heart forever",
		sections: [
			{
				title: "Services",
				links: [
					{ name: "Dashboard", href: "/dashboard" },
					{ name: "Create Story", href: "/pets/create-story" },
					{ name: "My Pets", href: "/pets" },
					{ name: "Profile", href: "/profile" },
				],
			},
			{
				title: "Support",
				links: [
					{ name: "Help Center", href: "#" },
					{ name: "Contact Us", href: "#" },
					{ name: "Privacy Policy", href: "#" },
					{ name: "Terms of Service", href: "#" },
				],
			},
			{
				title: "Company",
				links: [
					{ name: "About Us", href: "#" },
					{ name: "Blog", href: "#" },
					{ name: "Careers", href: "#" },
					{ name: "Press", href: "#" },
				],
			},
		],
		socialLinks: [
			{ name: "Facebook", href: "#", icon: "📘" },
			{ name: "Twitter", href: "#", icon: "🐦" },
			{ name: "Instagram", href: "#", icon: "📷" },
			{ name: "LinkedIn", href: "#", icon: "💼" },
		],
	},
};
