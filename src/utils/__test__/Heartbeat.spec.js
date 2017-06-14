import Logger from 'nti-util-logger';

import Heartbeat, {PacemakersByInterval, pacemakerForInterval, Pacemaker} from '../Heartbeat';  //eslint-disable-line

describe('Heartbeat Manager', () => {
	describe('Pacemaker', () => {
		test ('Throws error on bad arg', () => {
			expect(() => new Pacemaker()).toThrow();
			expect(() => new Pacemaker('1')).toThrow();
			expect(() => new Pacemaker({})).toThrow();
			expect(() => new Pacemaker(false)).toThrow();
			expect(() => new Pacemaker(true)).toThrow();
			expect(() => new Pacemaker(1000)).not.toThrow();
		});

		test ('Warns on low intervals', () => {
			const logger = Logger.get('analytics:Heartbeat');
			spyOn(logger, 'warn');
			expect(() => new Pacemaker(1)).not.toThrow();
			expect(logger.warn).toHaveBeenCalledWith('Creating a Pacemaker with a fast interval (%d).', 1);
		});

		test ('Does not start an interval on construction', () => {
			spyOn(global, 'setInterval');
			spyOn(global, 'setTimeout');
			spyOn(global, 'clearInterval');
			spyOn(global, 'clearTimeout');

			expect(() => new Pacemaker(10000)).not.toThrow();

			expect(clearInterval).not.toHaveBeenCalled();
			expect(clearTimeout).not.toHaveBeenCalled();
			expect(setInterval).not.toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();
		});

		test ('adding a Heartbeat starts the Pacemaker', ()=>{
			const fakeHB = {};
			const p = new Pacemaker(1000);

			expect(p.running).toBe(false);
			spyOn(p, 'start');

			p.add(fakeHB);
			expect(p.start).toHaveBeenCalled();
		});

		test ('removing the last Heartbeat stops the Pacemaker', ()=>{
			const fakeHB = {};
			const p = new Pacemaker(1000);

			expect(p.running).toBe(false);

			spyOn(p, 'start');
			spyOn(p, 'stop');

			p.add(fakeHB);
			expect(p.start).toHaveBeenCalled();

			p.remove(fakeHB);
			expect(p.stop).toHaveBeenCalled();
		});

		test ('attempting to remove anything from Pacemaker stops if size is 0', ()=>{
			const p = new Pacemaker(1000);
			spyOn(p, 'stop');

			p.remove();
			expect(p.stop).toHaveBeenCalled();
		});

		test ('starting a started Pacemaker does nothing', ()=>{
			const TIMER_ID = 1;
			spyOn(global, 'setInterval').and.returnValue(TIMER_ID);

			const p = new Pacemaker(1000);

			expect(p.running).toBe(false);

			p.start();
			expect(p.running).toBe(true);

			p.start();
			expect(setInterval).toHaveBeenCalledTimes(1);
			expect(setInterval).not.toHaveBeenCalledTimes(2);
		});

		test ('stopping frees the interval', ()=>{
			const TIMER_ID = 1;
			spyOn(global, 'setInterval').and.returnValue(TIMER_ID);
			spyOn(global, 'clearInterval');

			const p = new Pacemaker(1000);

			expect(p.running).toBe(false);

			p.start();
			expect(p.running).toBe(true);

			p.stop();
			expect(setInterval).toHaveBeenCalledTimes(1);
			expect(clearInterval).toHaveBeenCalledTimes(1);
			expect(clearInterval).toHaveBeenCalledWith(TIMER_ID);
		});

		test ('if started, "running" is true, false if stopped', ()=>{
			const TIMER_ID = 1;
			spyOn(global, 'setInterval').and.returnValue(TIMER_ID);
			spyOn(global, 'clearInterval');

			const p = new Pacemaker(1000);

			expect(setInterval).not.toHaveBeenCalled();
			expect(clearInterval).not.toHaveBeenCalled();
			expect(p.running).toBe(false);

			p.start();
			expect(p.running).toBe(true);
			expect(setInterval).toHaveBeenCalledTimes(1);
			expect(clearInterval).not.toHaveBeenCalled();

			p.stop();
			expect(p.running).toBe(false);
			expect(setInterval).toHaveBeenCalledTimes(1);
			expect(clearInterval).toHaveBeenCalledTimes(1);
			expect(clearInterval).toHaveBeenCalledWith(TIMER_ID);

		});
	});

	describe('pacemakerForInterval', () => {
		test ('pacemakerForInterval stores instances in PacemakersByInterval', ()=> {
			const a = pacemakerForInterval(2000);
			expect(a).toBeTruthy();

			const entry = Object.entries(PacemakersByInterval).find(([, value]) => value === a);

			expect(entry).toBeTruthy();
			expect(entry[1]).toBe(a);
		});


		test ('pacemakerForInterval reuses same Pacemaker', ()=> {
			const a = pacemakerForInterval(1000);
			const b = pacemakerForInterval(1000);
			expect(a).toBe(b);
		});

	});

	describe('Heartbeat', () => {

		test ('Construction throws without a callback', ()=>{
			expect(() => new Heartbeat()).toThrow();
			expect(() => new Heartbeat(0)).toThrow();
			expect(() => new Heartbeat({})).toThrow();
			expect(() => new Heartbeat('')).toThrow();
		});

		test ('Construction throws if optional interval is not a number', ()=>{
			const fn = () => {};

			expect(() => new Heartbeat(fn, '')).toThrow();
			expect(() => new Heartbeat(fn, false)).toThrow();
			expect(() => new Heartbeat(fn, true)).toThrow();
			expect(() => new Heartbeat(fn, {})).toThrow();
			expect(() => new Heartbeat(fn, 0)).toThrow();
		});

		test ('Construction adds instance to Pacemaker for interval', ()=>{
			const interval = 1100;
			const fn = () => {};
			const p = pacemakerForInterval(interval);
			spyOn(p, 'add');
			const h = new Heartbeat(fn, interval);
			expect(p.add).toHaveBeenCalledTimes(1);
			expect(p.add).toHaveBeenCalledWith(h);
		});

		test ('die() removes Heartbeat from Pacemaker for interval', ()=>{
			const interval = 1100;
			const fn = () => {};
			const p = pacemakerForInterval(interval);
			spyOn(p, 'add');
			spyOn(p, 'remove');
			const h = new Heartbeat(fn, interval);
			expect(p.add).toHaveBeenCalledTimes(1);
			expect(p.add).toHaveBeenCalledWith(h);

			p.add.calls.reset();

			h.die();
			expect(p.add).not.toHaveBeenCalled();
			expect(p.remove).toHaveBeenCalledTimes(1);
			expect(p.remove).toHaveBeenCalledWith(h);
		});

		test ('onPulse() calls die() if callback() returns exactly false', ()=>{
			const interval = 1100;
			const fn = () => false;
			const p = pacemakerForInterval(interval);
			spyOn(p, 'add');
			spyOn(p, 'remove');
			const h = new Heartbeat(fn, interval);

			expect(p.add).toHaveBeenCalledTimes(1);
			expect(p.add).toHaveBeenCalledWith(h);

			spyOn(h, 'die');
			expect(h.die).not.toHaveBeenCalled();
			h.onPulse();
			expect(h.die).toHaveBeenCalled();
		});

		test ('onPulse() calls die() if callback() throws', ()=>{
			const interval = 1100;
			const fn = () => {throw new Error('test');};
			const p = pacemakerForInterval(interval);
			spyOn(p, 'add');
			spyOn(p, 'remove');
			const h = new Heartbeat(fn, interval);

			expect(p.add).toHaveBeenCalledTimes(1);
			expect(p.add).toHaveBeenCalledWith(h);

			spyOn(h, 'die');
			expect(h.die).not.toHaveBeenCalled();
			h.onPulse();
			expect(h.die).toHaveBeenCalled();
		});

	});
});
