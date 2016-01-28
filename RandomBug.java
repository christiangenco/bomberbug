import info.gridworld.actor.*;
import info.gridworld.grid.*;
import java.util.*;
import java.awt.Color;

//Sound effects
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import javazoom.jl.player.Player;

public class RandomBug extends Bug{
	private int scale;
	private int step;
    public RandomBug(){
    	scale = 20 + (int)(Math.random() * 50);
    	step = + (int)(Math.random() * 20);
    	setColor(Color.GREEN);
    }
    
    public void act(){
    	//System.out.println(step + " " + scale);
    	if(step >= scale){
    		super.act();
    		step = 0;	
    	}
    	else
    		step++;
    }
    
}