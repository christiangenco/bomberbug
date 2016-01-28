import info.gridworld.actor.Rock;

public class Fire extends Rock{
	private int stage;
	//stage 0, instantiated
	//stage 1, fire (head)
	//stage 2, fireMiddle
	//stage 3, removeSelfFromGrid()
	
    public Fire(){this(0, 0);}
    public Fire(int direction){this(direction, 0);}
    public Fire(int direction, int stage){setDirection(direction); this.stage = stage;setColor(null);}
    public void act(){
    	stage++;
    	super.act();
    }
    
    public void setStage(int i){
    	stage = i;
    }
    
    public String getImageSuffix(){
    	if(stage >= 1) return "Middle";
    	return "";
    }
}