import info.gridworld.actor.*;
import info.gridworld.grid.*;
import java.util.*;
import java.awt.Color;

public class BlockBug extends RandomBug {
        
    /**
     * Creates a new instance of <code>BlockBug</code>.
     */
     private int stepz;
     private static int count=0;
     private ArrayList<Rock> keeper;
    public BlockBug() {
    	this(5);
    }
    public BlockBug(int sz){
    	stepz=sz;
    	setColor(new Color(   (int)(Math.random()*255),(int)(Math.random()*255),(int)(Math.random()*255)   ));
    	keeper=new ArrayList<Rock>();
    }
    
    public void removeSelfFromGrid(){   	
    	for(Rock b:keeper)
    		if(b.getGrid() != null){
    			b.removeSelfFromGrid();
    			if(b.getGrid() != null)//it's a wall
    				getGrid().remove(b.getLocation());   			
    		}

    	super.removeSelfFromGrid();
    }
    
    public void act(){
    	Location thisLoc=this.getLocation();
    	super.act();
    	
    		
    }
        public void move()
    {
        Grid<Actor> gr = getGrid();
        if (gr == null)
            return;
        Location loc = getLocation();
        Location next = loc.getAdjacentLocation(getDirection());
        if (gr.isValid(next))
            moveTo(next);
        else
            removeSelfFromGrid();
            
        if(count==stepz){
    		Rock brick;
    		if(Math.random() > .25)
    			brick = new Brick();
    		else
    			brick = new Wall();
    		
    		brick.setColor(getColor());
        	brick.putSelfInGrid(gr, loc);
        	keeper.add(brick);
    		count=0;
    	}
    	count++;
        
    }
    
   
}
