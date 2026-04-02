import { supabase } from '$lib/supabase.js';

class AuthState {
	currentUser = $state(null);
	initialized = $state(false);

	constructor() {
		if (typeof window !== 'undefined') {
			// Get initial session
			supabase.auth.getSession().then(({ data }) => {
				this.currentUser = data.session?.user || null;
				this.initialized = true;
			});

			// Listen for auth events seamlessly
			supabase.auth.onAuthStateChange((_event, session) => {
				this.currentUser = session?.user || null;
			});
		}
	}

	async signInWithGoogle() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: window.location.origin
			}
		});
		if (error) console.error("Google login error:", error);
	}

	async signOut() {
		await supabase.auth.signOut();
	}
}

export const authState = new AuthState();
