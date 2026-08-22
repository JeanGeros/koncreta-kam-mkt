export function timeAgo(dateStr: string): string {
	const diffMs = Date.now() - new Date(dateStr).getTime();
	const minutes = Math.floor(diffMs / 60000);
	if (minutes < 1) return 'justo ahora';
	if (minutes < 60) return `hace ${minutes} min`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `hace ${hours} h`;
	const days = Math.floor(hours / 24);
	if (days === 1) return 'ayer';
	if (days < 30) return `hace ${days} días`;
	return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}
