import crypto from 'crypto';

export function verifyPassword(password, stored) {
	try {
		if (!stored || !stored.includes(':')) return false;
		const [salt, hash] = stored.split(':');
		const verify = crypto.scryptSync(password, salt, 64).toString('hex');
		const hashBuf = Buffer.from(hash, 'hex');
		const verifyBuf = Buffer.from(verify, 'hex');
		if (hashBuf.length !== verifyBuf.length) return false;
		return crypto.timingSafeEqual(hashBuf, verifyBuf);
	} catch (e) {
		console.error('Password verification failed:', e);
		return false;
	}
}

const stored = 'cf293cd0ff31dff6e21c178a9440b49e:43e0f9ea0e4409d7f1c286bde36fb11650fa649a7ecc0371b6e8e4c5d03aaa6247964c3a4a9cb33e1a64e7dc4bd81479b810c0e2cb06c7cb9f4b9fe54570cca1';

console.log("admin:", verifyPassword('admin', stored));
console.log("admin123:", verifyPassword('admin123', stored));
console.log("password:", verifyPassword('password', stored));
console.log("admin@nexora.com:", verifyPassword('admin@nexora.com', stored));
