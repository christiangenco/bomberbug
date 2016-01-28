import info.gridworld.actor.*;
import info.gridworld.grid.*;
import java.util.*;
//Sound effects
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import javazoom.jl.player.Player;

public class Bomb extends Rock{
	private int timer;
	private int scale;
	private int step;
	private int radius; //radius of explosion
	private boolean exploding;
	private boolean calledExplode;
	private boolean superBomb;
	private Player player; 
	
	boolean[] finishedExploding;
	
	private ArrayList<Location> fire;
	
	private String suffix;
	
    public Bomb() {
    	this(4);
    }
    
    public Bomb(int timer){
    	this(timer, 2);
    }
    
    public Bomb(int timer, int radius){
    	this(timer, 40, radius);
    	//this(timer, 16, radius);//for a HUGE grid
    }
    
    public Bomb(int timer, int scale, int radius){
    	this.timer = timer;
    	this.scale = scale;
    	this.radius = radius;
    	setColor(null);
    	step = 0;
    	fire = new ArrayList<Location>();
    	exploding = false;
    	calledExplode = false;
    	finishedExploding = new boolean[4];
    	for(int i=0;i<finishedExploding.length;i++)finishedExploding[i] = false;
    	superBomb = false;
    	play("ticking");
    }
    
    public boolean isExploding(){
    	return exploding;
    }
	public void setExploding(boolean b){
		exploding = b;
	}
	public void setIsSuperBomb(boolean b){
		superBomb = b;
		if(superBomb == true)
			play("watch_out_superbomb");
	}
	public ArrayList<Location> getFire(){
		return fire;
	}
	public boolean getBombNorth(){
		//0
		return finishedExploding[0];
	}	
	public boolean getBombEast(){
		//90
		return finishedExploding[1];
	}
	public boolean getBombSouth(){
		//180
		return finishedExploding[2];
	}
	public boolean getBombWest(){
		//270
		return finishedExploding[3];
	}

    public String getImageSuffix(){
    	if(exploding){
    		return "CentralFire";
    	}

   		step++;
    	if(scale == step){
    		step = 0;
    		suffix = "" + timer;
    		
    		if(superBomb)
    			suffix = "SuperBomb";
    		
    		timer--;
    		//play sound
    		if(suffix.equals("3") || suffix.equals("2") || suffix.equals("1"))
    			play("countdown" + suffix);
    	}

    	if(timer < 0){exploding = true;play("fireball");}
    	
    	return suffix;
    }

	//returns true if a fire was successfully planted,
	//false if it was not or if it blew something up 
	//so future fires won't try again.
	public void explode(int direction){
		int index = direction/90;
		//System.out.println("direction int = " + direction + "\tindex = " + index);
		if(finishedExploding[index]) return;
		
		//System.out.println("Exploding " + direction);
		Grid<Actor> gr = getGrid(); if(gr == null) return;
		Fire f = new Fire(direction);
		Location loc = this.getLocation();
		Location next = loc.getAdjacentLocation(direction); 
		
		//is it a valid location?
		if(!gr.isValid(next)){
			finishedExploding[index] = true;
			return;
		}
		
		//figure out what's in "next"
		Actor occupant = gr.get(next);
		
		//it's empty (only on first explosion if nothing's in it)
		if(occupant == null){
			gr.put(next, f);
			fire.add(next);
			return;
		}
		
		//it's fire or a flower
		int fireCounter = 0;
		if(occupant instanceof Fire || occupant instanceof Flower || superBomb){
			//keep looping until it isn't fire
			fireCounter = 1;
			while((occupant instanceof Fire && fireCounter < radius) || occupant instanceof Flower || superBomb){
				fireCounter ++;
				
				//if it's a flower (or if it's something else and this == superbomb), set it on fire!
				if(!(occupant instanceof Fire)){
					Fire flowerFire = new Fire();
					flowerFire.setDirection(direction);
					fire.add(next);
					flowerFire.putSelfInGrid(gr, next);
					occupant = gr.get(next);
				}
				
				//make the icon the middle fire instead of the head fire	
				Fire fi = (Fire) occupant; 
				fi.setStage(2);					
				
				next = next.getAdjacentLocation(direction);
				
				//make sure the location is valid...AGAIN
				if(!gr.isValid(next)){
					finishedExploding[index] = true;
					return;
				}else
					occupant = gr.get(next);
			}
		}
		
		//is it still a valid location?
		//is it a valid location?
		if(!gr.isValid(next)){
			finishedExploding[index] = true;
			return;
		}
		
		//it's empty?
		if(occupant == null){
			gr.put(next, f);
			fire.add(next);
			return; 
		}
		
		//alright, it's a valid location, it isn't empty, and even if it
		//started out as fire, now we're at the end of the fire train.
		//It can only be three things now: a Bug, a Wall, or a Brick.
		//Bugs and Bricks explode, Walls do not.
		
		//if it's anything but a wall
		if(!(occupant instanceof Wall)){
			if(occupant.getGrid() != null)
				occupant.removeSelfFromGrid();
			
			//one last check for bonuses
			occupant = gr.get(next);
			if(!(occupant instanceof Bonus)){
				gr.put(next, f);
				fire.add(next);
			}
		}
		
		finishedExploding[index] = true;
    }
    
    public void act(){
    	if(!exploding) return;
    	
    	//if all of them say to stop by returning false
    	if(this.getBombNorth() && this.getBombSouth() && this.getBombEast() && this.getBombWest()){
    		//System.out.println("Done exploding!");
    		this.setExploding(false);
    		Grid gr = this.getGrid();
    		for(Location l:this.getFire())
    			gr.remove(l);
    		removeSelfFromGrid();
    	}else{
    		explode(0);
    		explode(180);
    		explode(90);
    		explode(270);	
    	}
    }
    
    public void play(String filename) {
    	filename = "sound\\" + filename + ".mp3";
        try {
            FileInputStream fis     = new FileInputStream(filename);
            BufferedInputStream bis = new BufferedInputStream(fis);
            player = new Player(bis);
        }
        catch (Exception e) {
            System.out.println("Problem playing file " + filename);
            System.out.println(e);
        }

        // run in new thread to play in background
        new Thread() {
            public void run() {
                try { player.play(); }
                catch (Exception e) { System.out.println(e); }
            }
        }.start();
    }
    
    public void removeSelfFromGrid(){
    	super.removeSelfFromGrid();
    }
    
    public String toString(){
    	return "Bomb";
    }
}