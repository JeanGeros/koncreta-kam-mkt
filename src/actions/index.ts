import { authActions } from './auth';
import { contactActions } from './contact';
import { projectActions } from './projects';
import { blogActions } from './blog';

export const server = {
	...authActions,
	...contactActions,
	...projectActions,
	...blogActions,
};
